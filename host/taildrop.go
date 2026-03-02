package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"io"

	"tailscale.com/tailcfg"
)

// handleSendFile decodes the base64 file data from the request and sends
// it to the target node using the Taildrop PushFile API.
func (h *Host) handleSendFile(req Request) {
	if err := h.requireInit("send-file"); err != nil {
		return
	}

	if req.NodeID == "" {
		h.sendError("send-file", "nodeID is required")
		return
	}
	if req.FileName == "" {
		h.sendError("send-file", "fileName is required")
		return
	}
	if req.FileData == "" {
		h.sendError("send-file", "fileData is required")
		return
	}

	// Decode the base64 file data.
	data, err := base64.StdEncoding.DecodeString(req.FileData)
	if err != nil {
		h.sendError("send-file", fmt.Sprintf("failed to decode file data: %v", err))
		return
	}

	targetID := tailcfg.StableNodeID(req.NodeID)
	size := int64(len(data))
	name := req.FileName

	// Send initial progress.
	h.send(Reply{
		Cmd: "fileSendProgress",
		FileSendProgress: &FileSendProgressReply{
			TargetNodeID: req.NodeID,
			Name:         name,
			Percent:      0,
			Done:         false,
		},
	})

	// Use a progress-tracking reader to report progress.
	pr := &progressReader{
		reader: bytes.NewReader(data),
		total:  size,
		onProgress: func(sent int64) {
			percent := float64(sent) / float64(size) * 100
			if percent > 100 {
				percent = 100
			}
			h.send(Reply{
				Cmd: "fileSendProgress",
				FileSendProgress: &FileSendProgressReply{
					TargetNodeID: req.NodeID,
					Name:         name,
					Percent:      percent,
					Done:         false,
				},
			})
		},
	}

	ctx := context.Background()
	err = h.lc.PushFile(ctx, targetID, size, name, pr)
	if err != nil {
		h.send(Reply{
			Cmd: "fileSendProgress",
			FileSendProgress: &FileSendProgressReply{
				TargetNodeID: req.NodeID,
				Name:         name,
				Percent:      0,
				Done:         true,
				Error:        fmt.Sprintf("failed to send file: %v", err),
			},
		})
		return
	}

	// Send completion.
	h.send(Reply{
		Cmd: "fileSendProgress",
		FileSendProgress: &FileSendProgressReply{
			TargetNodeID: req.NodeID,
			Name:         name,
			Percent:      100,
			Done:         true,
		},
	})
}

// progressReader wraps an io.Reader and calls onProgress with the total
// bytes read so far after each Read call.
type progressReader struct {
	reader     io.Reader
	total      int64
	sent       int64
	onProgress func(sent int64)
	// chunkSize controls how often progress is reported.
	// If zero, progress is reported on every read.
	lastReport int64
}

func (pr *progressReader) Read(p []byte) (int, error) {
	n, err := pr.reader.Read(p)
	pr.sent += int64(n)

	// Report progress at most every 10% to avoid flooding the extension.
	threshold := pr.total / 10
	if threshold < 1 {
		threshold = 1
	}
	if pr.sent-pr.lastReport >= threshold || err == io.EOF {
		pr.lastReport = pr.sent
		if pr.onProgress != nil {
			pr.onProgress(pr.sent)
		}
	}

	return n, err
}
