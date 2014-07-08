#Contributing to Inbox.js

- [Get the code](#get-the-code)
- [Install dependencies](#install-dependencies)
- [Working with the code](#working-with-the-code)
- [Commit Message Guidelines](#commit-message-guidelines)

## Get the code

```bash
git clone https://github.com/inboxapp/inbox.js.git

cd inbox.js
```

## Install dependencies

```bash
# Install devDependencies from NPM
npm install

# For testing, install an appropriate [karma](http://karma-runner.github.io/)
# browser launcher
npm install karma-chrome-launcher
```

## Working with the code

```bash
# Perform style checks to ensure that the code meets style guidelines
gulp lint

# Build the frameworks
gulp build
```

## Running unit tests

```bash
# Run unit tests
gulp test

# Run unit tests with custom browsers
gulp test --browsers <Custom browsers in comma-separated list>
```

##Commit message guidelines

Inbox.js is using a commit message scheme based on that used by [angular.js](https://github.com/angular/angular.js) and [conventional-changelog](https://www.npmjs.org/package/conventional-changelog), in order to simplify generation of meaningful changelogs, simplify bisecting to find and fix regressions, and to clarify what a given change has done.

All contributions should fit this format, and all contributions should be squashed as appropriate.

### Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on github as well as in various git tools.

### Type
Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug or adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

### Scope
The scope could be anything specifying place of the commit change. For example `utilities`,
`namespaces`, `angular-inbox.js`, `api`, `messages`, etc...

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

###Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes"
The body should include the motivation for the change and contrast this with previous behavior.

###Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.
