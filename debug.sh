STAGE="dev"
shift

# Remove old logs
rm -rf logs

# Prepare
export SLS_DEBUG=*

# Build
if npm run build; then
  echo "$(date '+%d/%m/%Y %H:%M:%S') The API in stage $STAGE built was successfully."
else
  echo "$(date '+%d/%m/%Y %H:%M:%S') The API in stage $STAGE built was failed."
  exit 1
fi

# Debug
node --inspect /home/joaquin/.nvm/versions/node/v21.7.1/bin/serverless offline start --stage $STAGE