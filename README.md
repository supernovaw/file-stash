# file-stash

This is a simple little project for storing and sharing personal files with self and a close group of people.

The web interface allows for file upload, retrieval and removal of files in each stash. Each stash is a directory in `<project_root>/files/`.
People can only see and use stashes they know names of. These names correspond to directory names. These names are thus essentially passwords, depending on privacy requirement. I refer to them as access codes.

New stashes can only be created using mkdir on the server side, and everything else can be manipulated without necessitating a restart.

Combined with OpenVPN and `sshfs`, the applications should be innumerable.
