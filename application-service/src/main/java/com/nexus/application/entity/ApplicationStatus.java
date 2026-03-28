package com.nexus.application.entity;

/**
 * Status flow: APPLIED → UNDER_REVIEW → SHORTLISTED or REJECTED
 */
public enum ApplicationStatus {
    APPLIED,
    UNDER_REVIEW,
    SHORTLISTED,
    REJECTED
}
