module.exports = {
  '*.{js,jsx,ts,tsx}': 'eslint  --quiet',
  '*.json': ['prettier --write', 'git add --force']
}
