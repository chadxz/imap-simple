# Contributing

We love pull requests. Here's a quick guide.

**note: this project doesn't really have tests yet. Once it does, the *test* steps below will be more applicable.**


Fork, then clone the repo:

```
git clone git@github.com:your-username/imap-simple.git
```

Install the node modules:

```
npm install
```

Make sure the tests pass:

```
npm test
```

Make your change. Add tests for your change. Make the tests pass:

```
npm test
```

Ensure that you are following the style guide and coding conventions enforced by jshint and jscs:

```
npm run lint
```

Add a line to [the changelog](CHANGELOG.md) under "Unreleased" that describes the change you made. If you aren't familiar with
the best way to format your entry, see [keepachangelog.com](http://keepachangelog.com)

Push to your fork and [submit a pull request](https://github.com/chadxz/waterline-custom-validations/compare/).

At this point you're waiting on us. We like to at least comment on pull requests
within three business days (and, typically, one business day). We may suggest
some changes or improvements or alternatives.

Some things that will increase the chance that your pull request is accepted:

 - Write tests.
 - Lint your code with jshint + jscs.
 - Write a [good commit message](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).
