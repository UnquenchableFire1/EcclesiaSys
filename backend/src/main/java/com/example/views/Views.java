package com.example.views;

/**
 * Define JSON view interfaces for selective serialization.
 */
public class Views {
    /**
     * Publicly accessible information.
     */
    public interface Public {}

    /**
     * Information visible to members.
     */
    public interface Member extends Public {}

    /**
     * Full internal information, restricted to admins.
     */
    public interface Admin extends Member {}
}
