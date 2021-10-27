import re
from scrapy.http import HtmlResponse
from w3lib.html import remove_tags
from music_concerts.items import Concert, Ticket, GeoLocation

def parse_concert_taquillaCOM(response: HtmlResponse):
    concerts = []

    ## Genre and rating property only appear on main response
    # Genre
    genres = []
    for genre in response.css('.new_breadcrumb-list').xpath('li[3]/a/span[@itemprop="name"]/text()').get().split('/'):
        genres.append(genre)
    genres.sort()
    # Rating
    rating_score = float(response.xpath('//div[@class="score-container"]/div[@class="score"]/text()').get()
                         .replace(',', '.')) / 5
    rating_num = response.xpath('//div[@class="score-container"]/div[@class="reviews-stats"]'
                                '/span[@class="reviews-num"]/text()').get()
    # Info
    info = []
    info_content = response.xpath('//div[@class="tabbed-indexcard"]/div[@class="card-content"]')
    if info_content is not None:
        for item in info_content.xpath('div'):
            for p in item.xpath('p'):
                info.append(remove_tags(p.get()))
    info = ''.join(info)

    for item in response.xpath('//div[@id="tickets-list"]/ul[@class="ent-results-list"]/li'):

        # Retrieve data
        title = item.xpath('meta[@itemprop="name"]/@content').get()
        artists = item.xpath('div[@itemprop="performer"]/meta[@itemprop="name"]/@content').get()
        image = item.xpath('meta[@itemprop="image"]/@content').get()
        place = item.xpath('div[@itemprop="location"]/meta[@itemprop="name"]/@content').get()
        address = "{0}, {1}, {2}".format(
            item.xpath('div[@itemprop="location"]/div[@itemprop="address"]/meta[@itemprop="streetAddress"]/@content').get(),
            item.xpath('div[@itemprop="location"]/div[@itemprop="address"]/meta[@itemprop="addressLocality"]/@content').get(),
            item.xpath('div[@itemprop="location"]/div[@itemprop="address"]/meta[@itemprop="addressCountry"]/@content').get())
        geo = GeoLocation()
        geo['lat'] = item.xpath('div[@itemprop="location"]/div[@itemprop="geo"]/meta[@itemprop="latitude"]/@content').get()
        geo['lon'] = item.xpath('div[@itemprop="location"]/div[@itemprop="geo"]/meta[@itemprop="longitude"]/@content').get()

        # Retrieve ticket info
        tickets = []

        date = item.xpath('meta[@itemprop="startDate"]/@content').get()
        time = item.xpath('ul[@class="ent-results-list-hour"]/li'
                          '/div[@class="ent-results-list-hour-time ent-results-list-hour-item"]/span/text()').get()
        if re.match(r"^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$", time):
            date += " " + time

        for link in item.xpath('ul/li/ul/li[has-class("data-link-out")]'):
            ticket = Ticket()
            ticket['date'] = date
            price = link.xpath('div/span[@class="enti-item-price"]/text()').get()
            ticket['price'] = re.sub('[^0-9,]', "", price).replace(",", ".")
            ticket['link'] = 'https://' + link.xpath('@data-link').get()[2:]
            tickets.append(ticket)

        ## Check if existing concert
        concert = next((c for c in concerts if (c['title'] == title and c['address'] == address)), None)
        # If non existent create and add to collection
        if concert is None:
            concert = Concert()
            concert['title'] = title
            concert['artists'] = artists
            concert['image'] = image
            concert['place'] = place
            concert['address'] = address
            concert['geo_location'] = dict(geo)
            concert['genre'] = genres
            concert['description'] = info
            concert['rating_score'] = rating_score
            concert['rating_num'] = rating_num
            concert['origin'] = 'taquilla.com'
            concert['tickets'] = list(map(lambda x: dict(x), tickets))
            concerts.append(concert)
        else:
            concert['tickets'] += list(map(lambda x: dict(x), tickets))

    return concerts

def parse_concert_atrapaloCOM(response: HtmlResponse):
    return []
