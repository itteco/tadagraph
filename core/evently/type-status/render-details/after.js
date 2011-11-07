function(e, doc) {
    applyThumbs(this);
    APPS.core.require('vendor/tadagraph/lib/oembed').wrap(this);
    
    $('.embed-list .embed .thumb object', this).attr('width', "100%");
    $('.embed-list .embed .thumb embed', this).attr('width', "100%");
    $('.embed-list .embed .thumb iframe', this).attr('width', "100%");
}