package com.wordnote.domain.box.entity;

public enum State {
    READY,
    IN_PROGRESS,
    DONE;

    public boolean canMoveTo(State next) {
        return switch (this) {
            case READY -> next == IN_PROGRESS;
            case IN_PROGRESS -> next == DONE;
            case DONE -> false;
        };
    }
}

