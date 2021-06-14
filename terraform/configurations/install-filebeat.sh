TARGET="$1"

test -f 'filebeat-7.7.0-linux-x86_64' || curl -ksSL https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.7.0-linux-x86_64.tar.gz -o filebeat-7.7.0-linux-x86_64.tar.gz

# Upload installation file
ssh ${TARGET} test -f '~/filebeat-7.7.0-linux-x86_64.tar.gz' || scp filebeat-7.7.0-linux-x86_64.tar.gz ${TARGET}:./

# Extract package
ssh ${TARGET} test -d '~/filebeat-7.7.0-linux-x86_64' || ssh ${TARGET} bash -c 'cd ~/ && tar -xzf filebeat-7.7.0-linux-x86_64.tar.gz'

# Upload Environment Variables
scp .env ${TARGET}:./filebeat-7.7.0-linux-x86_64/

# Upload filebeat configuration file
scp filebeat.yml ${TARGET}:./filebeat-7.7.0-linux-x86_64/
