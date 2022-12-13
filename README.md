# google-chat-clone
Beatify json data from Google Chat. Made by Gabriel Barrientos in 2022.
Thanks [Thekawaiicokie](https://github.com/Thekawaiicokie) for the support! :D

## Video Demo: https://youtu.be/disgVw-droY
## Description
This project is essentially a beautifier, what it does is it reads a folder
that contains google chat exported data and reformats it using html. The reason
being that the google chat data is in json, which can be really uncomfortable
to read. I tried to make it look like google chat, but only to some extent,
because my real reason was to make it useful for people who want to reread
their exported conversations.

## Code explanation
The code is not really complicated, it only consists of two files: index.js and
utils.js. I will explain each one in more detail later. `index.js` controlls
the execution logic, while `utils.js` is a file containing all sorts of
functions used in the program. Well, there's actually a third file:
`group.html` but that one is only a layout, a file used to make the html files
so all of them look the same.

### `index.js`
This file is really simple. It only consists of a main function that is the
starting point of the application. Since the logic has been extracted away,
this function can simply call `get_user_info()` or `create_html_file()`, etc. I
did it like this because this way when there's to make a change in the code,
there's no need to alter the `index.js` file, maybe to some things, but in the
majority of cases it won't be necessary, they will just be made in the
`utils.js` file.

### `utils.js` This is the file that really takes care of solving the problem.
It has a lot of functions, I will explain in the same order they are used in
`index.js`. First of all, we have:

#### `check_paths()`
This functions is a wrapper for more functions, it also calls
`check_groups_path()` and `check_user_paths()`. In general terms what it does
is this: It checks that the provided folder exist, and that it contains both
the Groups and Users folder. If something fails it's better to not keep going
because the data might be in a broken format. At the end it also returns the
path for the Groups and Users folder within.

#### `get_user_info()`
This functions takes care of reading the information associated with the user
that generated the backup. Along the way it also checks where the user info is
missing or other kind of error has ocurred. If it run until the end, then it
returns an object that contains the user data.

#### `get_groups_info()`
With this function we can get the info related to every group (chat) that is in
the backup. As there might be some chats that have no messages, the functions
knows that so it only bothers adding the groups that do have messages, so that
we don't generate empty html files at the end. The metadata files also contain
the main user, so we need to pass that info to this function so it knows which
users to include. This function acts as a wrapper for `get_group_info()`.

#### `get_group_info()`
We get the info to specific user and a group. Inside this function we actually
read the metadata and get the users that are not the main user. We do that by
comparing the name and email, asserting that they are different to the main
user. At the end we add the `path` property to it, because we are going to need
later when we create the html files.

#### `create_html_file()`
This is the function that has the most logic attached to it. I will try to
explain in the say as I did with the `index.js` file. First I store in a
variable all the messages that came in the JSON data. Then inside a loop we
iterate over every message and process it, for that we have a separte function.
For every message we need to determine if the date or the user has changed in
comparison to the previous one. This is useful because that way we can change
the name and the date only when it's necessary. The last thing we do in every
message is get the current text, and if there is, we sanitize it and create an
html element containing it. A similar logic is applied to get the attached
files. Right at the we simply need to check if there's already a file with the
name `messages.html` so that we don't overwrite it.

##### `replace_bad_characters()`
Simple function that replaces some potentially dangerous characters in the
text, such as ', ", <, etc. It's called in every message.

##### `process_attached_file()`
This function abstracts away the logic for checking the type of a file, cause
we need to do different things depending on the type of the simple. For
example, we will use `<img>` for displaying images, `<audio>` for audios and
`<video>` for videos. For each one of those we have the functions:
`is_video()`, `is_audio()` and `is_image()`.

##### `update_image_name()`
This is the last function worth discussing. The issue with the image names, is
that sometimes, two or more images would have the exact name name in the
properties. This is not an issue in Google because they maybe have another way
to distinguish the names, or maybe that only happened before they started using
uuid to complete the name. We do know that the numbers are sequentially during
the date. Since we are reading the messages in order, everytime we find an
image, we can store, and then before adding it to the html we just check to see
if it was already there. In that case we simply keep track of the number and
append it to the end. But we have to reset the image object after every chat,
or we might get wrong results.

##### `create_html()`
Final function that just replaces the base html with the new messages, and it
also adds a title to identify each chat.
