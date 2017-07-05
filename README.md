## Encrypted Bookmarks

Encrypted Bookmarks allows Chromium users to store private bookmarks encrypted in the browser's local storage. Encrypted bookmarks are added using the right-click context menu, and bookmarks are accessed via the extension toolbar.

The required permissions are explained [here](/DOCUMENTATION.md#permissions).

#### How it works

The extension generates a keypair on installation using asymmetric encryption (OpenPGP.js) - encrypted the private key with a user passphrase. To add a bookmark the `title` and `url` of a tab are encrypted using the public key. Bookmarks are decrypted on access using the private key - that is decrypted using a user passphrase.

---

#### Privacy

Encrypted Bookmarks does not collect any user data. 

#### License

Copyright 2017 Aaron Horler

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
