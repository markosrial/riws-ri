# RI - Concerts Search App

## Environment
- Elastic cluster is necessary to run both projects. In the `docker` folder use the command:
    ```
    docker compose up
    ```

## Scrapy project 

- Activate virtual env:
  ```
  source venv/bin/activate
  ```

### Commands

- Create new spider for `domain`:
    ```
    scrapy genspider <domain> <domain.com>
    ```
- Run a spider self-contained in the `spider` Python file:
    ```
    scrapy runspider <spider>.py
    ```
- Start crawling using the `name_class` spider
    ```
    scrapy crawl <name_class>
    scrapy crawl [taquilla_com|atrapalo_com]
    ```

## React project
### Requirements:

- Node 8+

### Commands

- Run app
    ```
    npm install (first time)
    npm run start
    ```
