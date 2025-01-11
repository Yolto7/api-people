# Function to display help
usage() {
  echo "Usage: $0 -s stage [-r region]"
  echo "  -s stage    Specify the stage (dev or prod)."
  echo "  -r region   Specify the AWS region (default: us-east-1)."
  exit 1
}

# Predetermined values
REGION="us-east-1"

# Parse arguments
while getopts ":s:r:" opt; do
  case ${opt} in
    s)
      STAGE=$OPTARG
      if [[ "$STAGE" != "dev" && "$STAGE" != "prod" ]]; then
        echo "Error: Stage must be 'dev' or 'prod'."
        usage
      fi
      ;;
    r)
      REGION=$OPTARG
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      usage
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      usage
      ;;
  esac
done

# Verify that the required arguments have been provided
if [ -z "$STAGE" ]; then
  echo "Error: Stage is required."
  usage
fi

# Prepare
if npm run compliance; then
  echo "$(date '+%d/%m/%Y %H:%M:%S') The API in stage $STAGE prepared was successfully."
else
  echo "$(date '+%d/%m/%Y %H:%M:%S') The API in stage $STAGE prepared was failed."
  exit 1
fi

# Build
if npm run build; then
  echo "$(date '+%d/%m/%Y %H:%M:%S') The API in stage $STAGE built was successfully."
else
  echo "$(date '+%d/%m/%Y %H:%M:%S') The API in stage $STAGE built was failed."
  exit 1
fi

# Deploy
if sls deploy --stage $STAGE --region $REGION; then
  echo "$(date '+%d/%m/%Y %H:%M:%S') The API in stage $STAGE deployed was successfully."
else
  echo "$(date '+%d/%m/%Y %H:%M:%S') The API in stage $STAGE deployed was failed."
fi