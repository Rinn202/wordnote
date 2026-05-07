package com.wordnote.domain.workbox.entity;

public enum Status {
    READY,
    IN_PROGRESS,
    DONE;

    public boolean canMoveTo(Status next) {
        return switch (this) {
            case READY -> next == IN_PROGRESS;
            case IN_PROGRESS -> next == DONE;
            case DONE -> false;
        };
    }
}

