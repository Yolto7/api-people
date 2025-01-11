STAGE="dev"
shift

# Build
rm -rf logs
npm run build

# Debug
export SLS_DEBUG=*
node --inspect /home/joaquin/.nvm/versions/node/v21.7.1/bin/serverless offline start --stage $STAGE