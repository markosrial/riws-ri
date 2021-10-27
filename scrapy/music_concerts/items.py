# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html
import scrapy


class GeoLocation(scrapy.Item):
    lat = scrapy.Field()
    lon = scrapy.Field()


class Ticket(scrapy.Item):
    date = scrapy.Field()
    price = scrapy.Field()
    link = scrapy.Field()


class Concert(scrapy.Item):
    title = scrapy.Field()
    artists = scrapy.Field()  # artist/groups
    image = scrapy.Field()
    genre = scrapy.Field()
    place = scrapy.Field()
    address = scrapy.Field()
    geo_location = scrapy.Field(serializer=GeoLocation)
    duration = scrapy.Field()
    description = scrapy.Field()
    rating_score = scrapy.Field()  # range 0-5
    rating_num = scrapy.Field()
    origin = scrapy.Field()
    tickets = scrapy.Field(serializer=Ticket)
