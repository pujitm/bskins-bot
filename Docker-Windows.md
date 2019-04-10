# Docker on Windows

See https://blog.jongallant.com/2017/11/ssh-into-docker-vm-windows/ for accessing the logs.

## Getting Started

Create a `mongodbdata` docker volume with `docker volume create mongodbdata`

Run the application using `docker-compose up --build`

## Listing Contents

`docker run --rm -i -v=mongodbdata:/tmp/myvolume busybox find /tmp/myvolume`

Make sure to run that command from command prompt. Git bash didn't work and said that the directory wasn't found on the local filesystem.