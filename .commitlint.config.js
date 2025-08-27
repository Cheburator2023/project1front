let pullRequestRegexp = /^Merge pull request #\d+:.*/s;

module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [(commit) => pullRequestRegexp.test(commit)],
  rules: {
    'body-max-line-length': [1, 'always', 1000],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
    'header-max-length': [2, 'always', 1000],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'type-enum': [2, 'always', ['feat', 'fix', 'refactor']],
  },
};

