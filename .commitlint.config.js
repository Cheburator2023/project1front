let pullRequestRegexp = /^Merge pull request #\d+:.*/s;
module.exports = {
    extends: ['@commitlint/config-conventional'],
    ignores: [(commit) => pullRequestRegexp.test(commit), (commit) => commit.startsWith('i,rv'), (commit) => commit.startsWith('active')],
    rules: {
        "body-max-line-length": [1, "always", 100],
    },
};
