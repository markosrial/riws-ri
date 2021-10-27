import logging

from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors import LinkExtractor
from music_concerts import loaders

class AtrapaloCOMSpider(CrawlSpider):

    name = 'atrapalo_com'
    allowed_domains = ['atrapalo.com']
    start_urls = ['https://www.atrapalo.com/entradas/concierto-de-navidad-hillsong-barcelona_e4869970/']

    rules = (
        # Relevant docs in the domain
        Rule(LinkExtractor(allow=[r'entradas/\w+']),callback='parse',follow=True),
    )

    custom_settings = {
        # 'LOG_LEVEL': 'INFO',
        'DOWNLOAD_DELAY': 0.5,
        'CONCURRENT_REQUESTS_PER_IP': 20,

        ### BFA - Breadth first approach config - https://doc.scrapy.org/en/latest/faq.html#faq-bfo-dfo
        'DEPTH_PRIORITY': 1,
        'SCHEDULER_DISK_QUEUE': 'scrapy.squeues.PickleFifoDiskQueue',
        'SCHEDULER_MEMORY_QUEUE': 'scrapy.squeues.FifoMemoryQueue',
        ### BFA

        'DEPTH_LIMIT': 4,
        'DOWNLOAD_TIMEOUT': 10,

        'ITEM_PIPELINES': {
            'music_concerts.pipelines.SaveElasticsearchPipeline': 300,
        },

        'ELASTICSEARCH_SERVERS_URI': ['localhost:9200'],
        'ELASTICSEARCH_INDEX': 'riws_concerts'
    }

    def parse(self, response):
        try:
            # check if is under '/musica/conciertos' navigation
            if response.xpath('//section[@class="breadcrumb show-for-medium column breadcrumb"]/div/p[@class="bread"]/a[contains(@href, "/musica/conciertos")]').get() is not None:
                concerts = loaders.parse_concert_atrapaloCOM(response)
                for concert in concerts:
                    yield concert
                return
            else:
                logging.debug("No concert event: " + response.url)
        except Exception as e:
            logging.error("An exception occurred when processing an \'/entradas\' page")
