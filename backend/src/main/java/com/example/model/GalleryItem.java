package com.example.model;

import java.time.LocalDateTime;

public class GalleryItem {
    private int id;
    private String title;
    private String caption;
    private String mediaUrl;       // image, video, or audio URL
    private String mediaType;      // PHOTO | VIDEO | AUDIO
    private boolean isSermon;      // true if VIDEO/AUDIO is classified as a sermon
    private String folderName;     // album/folder this item belongs to (optional)
    private Integer branchId;      // null = visible to all branches (global)
    private int uploadedBy;
    private String uploaderName;
    private LocalDateTime uploadedAt;

    public GalleryItem() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }

    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }

    public boolean isSermon() { return isSermon; }
    public void setSermon(boolean sermon) { isSermon = sermon; }

    public String getFolderName() { return folderName; }
    public void setFolderName(String folderName) { this.folderName = folderName; }

    public Integer getBranchId() { return branchId; }
    public void setBranchId(Integer branchId) { this.branchId = branchId; }

    public int getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(int uploadedBy) { this.uploadedBy = uploadedBy; }

    public String getUploaderName() { return uploaderName; }
    public void setUploaderName(String uploaderName) { this.uploaderName = uploaderName; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
