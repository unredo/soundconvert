# Sound Convert

## Description

Containerised application for converting WAV audio files to OGG Opus. Jobs are created and distributed among converter services which use FFMPEG. BullMQ manages the jobs, with Valkey as the backing database. After the conversion, a ZIP archive containing the resulting files can be downloaded. Finished jobs are removed after 30 minutes. The application does not have identity and access managment (IAM).

## Services

```asciiart
 +----------+      +----------+      +-----------+
 |  Client  | ---> |  Proxy   | ---> | Frontend  |
 +----------+      +----------+      +-----------+
                                           |
                                           |
                                           v
                                     +-----------+
                        -----------> | Mediator  | <-----------
                        |            +-----------+            |
                        |                  ^                  |
                        |                  |                  |
                        |                  v                  |
                  +-----------+      +-----------+      +-----------+
                  | Converter | ---> |  Valkey   | <--- | Converter |
                  +-----------+      +-----------+      +-----------+
```

## Notifications

The frontend container follows the BFF (Backend for Frontend) approach. When the job list is open, a SSE connection to the server is established. The server polls the mediator service for changes and notifies the frontend accordingly. The frontend displays a reload button in the following cases:

- new jobs have been created
- jobs already available in the fronted
  - have changed due to ongoing file conversions
  - have been deleted in another browser window

When the user deletes a job, the reload button is not displayed, as a reload is not necessary in this case.

## Mediator Job Queues

- flowQueue: main file conversion job, has one child job for each file
- convertQueue: child job to convert a single WAV file into the OGG format
- cleanupQueue: job to delete archives and set the `cleanup` flag in the flowQueue job
- delUpdateIdsQueue: remove outdated update notifications as they are no longer needed

Note: after cleanup the job archive is gone. A download is not possible anymore and the job gets displayed with 'strikethrough' text in the frontend.

## Instructions

### Development & Testing

- Valkey can be started on its own: `docker compose up valkey`
- every service needs some environment variables
- create an `.env` file for each service
- take a look at `docker-compose.yaml` for reference
- start a service like this: `npm run -w services/<name> dev`
- see the `package.json` files for other tasks

### Running the Application

- execute `docker compose up` to start the services
- open `http://convert.docker.localhost:8080/`
