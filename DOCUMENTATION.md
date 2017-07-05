### Documentation

#### Permissions

The permissions Encrypted Bookmarks requires on install are declared in the manifest.

    "permissions": [
		"contextMenus",
		"storage",
		"tabs"
    ]

Each permission is required for the reasons set out below.

**contextMenus** 

To create a context menu entry. 

This entry is used to add a bookmark.

**storage**

To save and access bookmarks, and extension options.

**tabs**

To access the title and url of a tab that is being added as a bookmark.
