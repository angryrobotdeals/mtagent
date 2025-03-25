#!/bin/bash

if [ -f ".env" ]; then
  while IFS='=' read -r key value; do
    export "$key=$value"
  done < ".env"
else
  echo "File .env not found"
  exit 1
fi

scp -i "$APP_SERVER_SSH_KEY" ./.env.production "$APP_SERVER_USER":/repos/mtagent/.env

ssh -i "$APP_SERVER_SSH_KEY" "$APP_SERVER_USER" << "EOF"

# Move to the directory with the repository
cd /repos/mtagent || exit
pwd

# Стягиваем последние изменения из репозитория
git reset --hard
git checkout main
git reset --hard
git pull

# Stop containers
docker compose -p mtagent -f docker-compose.yml down --remove-orphans

docker volume rm mtagent_mtagent_data
docker image rm mtagent

# REMOVE ALL UNUSED DATA
docker image prune -f -a
docker volume prune -f

# Поднимаем контейнеры с последними изменениями
docker compose -p mtagent -f docker-compose.yml build
docker compose --env-file .env -p mtagent -f docker-compose.yml up -d --remove-orphans
EOF

# Сообщаем об успешном выполнении скрипта
echo "Deploy Done!"
