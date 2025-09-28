/**
 * Platform definitions with colors and URLs - Complete list from trait file
 */
export const platforms = {
    // Core Social Media Platforms
    'facebook': {
        name: 'Facebook',
        color: '#1877f2',
        url: 'https://www.facebook.com/sharer/sharer.php?u={url}',
        target: '_blank',
        category: 'social'
    },
    'x_com': {
        name: 'X.com',
        color: '#000000',
        url: 'https://x.com/intent/tweet?url={url}&text={title}',
        target: '_blank',
        category: 'social'
    },
    'linkedin': {
        name: 'LinkedIn',
        color: '#0077b5',
        url: 'https://www.linkedin.com/sharing/share-offsite/?url={url}',
        target: '_blank',
        category: 'professional'
    },
    'whatsapp': {
        name: 'WhatsApp',
        color: '#25d366',
        url: 'https://api.whatsapp.com/send?text={title}%20{url}',
        target: '_blank',
        category: 'messaging'
    },
    'telegram': {
        name: 'Telegram',
        color: '#0088cc',
        url: 'https://t.me/share/url?url={url}&text={title}',
        target: '_blank',
        category: 'messaging'
    },
    'pinterest': {
        name: 'Pinterest',
        color: '#bd081c',
        url: 'https://pinterest.com/pin/create/button/?url={url}&description={title}',
        target: '_blank',
        category: 'visual'
    },
    'reddit': {
        name: 'Reddit',
        color: '#ff4500',
        url: 'https://reddit.com/submit?url={url}&title={title}',
        target: '_blank',
        category: 'social'
    },
    'email': {
        name: 'Email',
        color: '#ea4335',
        url: 'mailto:?subject={title}&body={url}',
        target: '_self',
        category: 'communication'
    },
    'tumblr': {
        name: 'Tumblr',
        color: '#35465c',
        url: 'https://www.tumblr.com/widgets/share/tool?canonicalUrl={url}&title={title}',
        target: '_blank',
        category: 'social'
    },
    'teams': {
        name: 'Microsoft Teams',
        color: '#6264a7',
        url: 'https://teams.microsoft.com/share?href={url}',
        target: '_blank',
        category: 'messaging'
    },

    // Messaging & Communication
    'messenger': {
        name: 'Messenger',
        color: '#0084ff',
        url: 'fb-messenger://share/?link={url}',
        target: '_blank',
        category: 'messaging'
    },
    'instagram': {
        name: 'Instagram',
        color: '#e4405f',
        url: 'https://www.instagram.com/?url={url}',
        target: '_blank',
        category: 'visual'
    },
    'viber': {
        name: 'Viber',
        color: '#665cac',
        url: 'viber://forward?text={title}%20{url}',
        target: '_blank',
        category: 'messaging'
    },
    'line': {
        name: 'Line',
        color: '#00b900',
        url: 'https://social-plugins.line.me/lineit/share?url={url}',
        target: '_blank',
        category: 'messaging'
    },
    'snapchat': {
        name: 'Snapchat',
        color: '#fffc00',
        url: 'https://www.snapchat.com/share?url={url}',
        target: '_blank',
        category: 'social'
    },
    'wechat': {
        name: 'WeChat',
        color: '#7bb32e',
        url: 'https://api.wechat.com/cgi-bin/share?url={url}',
        target: '_blank',
        category: 'messaging'
    },
    'sms': {
        name: 'SMS',
        color: '#6cbf84',
        url: 'sms:?body={title}%20{url}',
        target: '_self',
        category: 'messaging'
    },
    'slack': {
        name: 'Slack',
        color: '#4a154b',
        url: 'https://slack.com/share?url={url}',
        target: '_blank',
        category: 'professional'
    },

    // Bookmarking & Reading
    'pocket': {
        name: 'Pocket',
        color: '#ef3f56',
        url: 'https://getpocket.com/save?url={url}&title={title}',
        target: '_blank',
        category: 'bookmarking'
    },
    'evernote': {
        name: 'Evernote',
        color: '#00a82d',
        url: 'https://www.evernote.com/clip.action?url={url}&title={title}',
        target: '_blank',
        category: 'bookmarking'
    },
    'instapaper': {
        name: 'Instapaper',
        color: '#428bca',
        url: 'https://www.instapaper.com/hello2?url={url}&title={title}',
        target: '_blank',
        category: 'bookmarking'
    },

    // Developer & Tech Communities
    'github': {
        name: 'GitHub',
        color: '#333333',
        url: 'https://github.com/share?url={url}',
        target: '_blank',
        category: 'developer'
    },
    'gitlab': {
        name: 'GitLab',
        color: '#fc6d26',
        url: 'https://gitlab.com/share?url={url}',
        target: '_blank',
        category: 'developer'
    },
    'stackoverflow': {
        name: 'Stack Overflow',
        color: '#f48024',
        url: 'https://stackoverflow.com/share?url={url}',
        target: '_blank',
        category: 'developer'
    },
    'dev': {
        name: 'Dev.to',
        color: '#0a0a0a',
        url: 'https://dev.to/share?url={url}',
        target: '_blank',
        category: 'developer'
    },
    'hackernews': {
        name: 'Hacker News',
        color: '#ff6600',
        url: 'https://news.ycombinator.com/submitlink?u={url}&t={title}',
        target: '_blank',
        category: 'developer'
    },

    // Business & Professional
    'discord': {
        name: 'Discord',
        color: '#5865f2',
        url: 'https://discord.com/share?url={url}',
        target: '_blank',
        category: 'gaming'
    },
    'zoom': {
        name: 'Zoom',
        color: '#2d8cff',
        url: 'https://zoom.us/share?url={url}',
        target: '_blank',
        category: 'professional'
    },

    // Video & Streaming
    'youtube': {
        name: 'YouTube',
        color: '#ff0000',
        url: 'https://www.youtube.com/share?url={url}',
        target: '_blank',
        category: 'video'
    },
    'tiktok': {
        name: 'TikTok',
        color: '#000000',
        url: 'https://www.tiktok.com/share?url={url}',
        target: '_blank',
        category: 'video'
    },
    'twitch': {
        name: 'Twitch',
        color: '#9146ff',
        url: 'https://www.twitch.tv/share?url={url}',
        target: '_blank',
        category: 'gaming'
    },

    // News & Media
    'medium': {
        name: 'Medium',
        color: '#000000',
        url: 'https://medium.com/share?url={url}',
        target: '_blank',
        category: 'publishing'
    },
    'wordpress': {
        name: 'WordPress',
        color: '#21759b',
        url: 'https://wordpress.com/press-this.php?u={url}&t={title}',
        target: '_blank',
        category: 'publishing'
    },
    'blogger': {
        name: 'Blogger',
        color: '#ff5722',
        url: 'https://www.blogger.com/blog-this.g?u={url}&n={title}',
        target: '_blank',
        category: 'publishing'
    },

    // International Social Media
    'vk': {
        name: 'VKontakte',
        color: '#4c75a3',
        url: 'https://vk.com/share.php?url={url}&title={title}',
        target: '_blank',
        category: 'social'
    },
    'odnoklassniki': {
        name: 'Odnoklassniki',
        color: '#ed812b',
        url: 'https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl={url}',
        target: '_blank',
        category: 'social'
    },
    'weibo': {
        name: 'Weibo',
        color: '#e6162d',
        url: 'https://service.weibo.com/share/share.php?url={url}&title={title}',
        target: '_blank',
        category: 'social'
    },
    'qq': {
        name: 'QQ',
        color: '#12b7f5',
        url: 'https://connect.qq.com/widget/shareqq/index.html?url={url}&title={title}',
        target: '_blank',
        category: 'social'
    },
    'douban': {
        name: 'Douban',
        color: '#007722',
        url: 'https://www.douban.com/share/service?href={url}&name={title}',
        target: '_blank',
        category: 'social'
    },
    'baidu': {
        name: 'Baidu',
        color: '#2319dc',
        url: 'https://cang.baidu.com/do/add?it={title}&iu={url}',
        target: '_blank',
        category: 'social'
    },

    // Music & Entertainment
    'spotify': {
        name: 'Spotify',
        color: '#1db954',
        url: 'https://open.spotify.com/search/{title}',
        target: '_blank',
        category: 'entertainment'
    },
    'soundcloud': {
        name: 'SoundCloud',
        color: '#ff5500',
        url: 'https://soundcloud.com/search?q={title}',
        target: '_blank',
        category: 'entertainment'
    },

    // Professional Networks
    'xing': {
        name: 'XING',
        color: '#026466',
        url: 'https://www.xing.com/spi/shares/new?url={url}',
        target: '_blank',
        category: 'professional'
    },
    'behance': {
        name: 'Behance',
        color: '#1769ff',
        url: 'https://www.behance.net/search?search={title}',
        target: '_blank',
        category: 'professional'
    },
    'dribbble': {
        name: 'Dribbble',
        color: '#ea4c89',
        url: 'https://dribbble.com/search?q={title}',
        target: '_blank',
        category: 'professional'
    },

    // News & Aggregators
    'digg': {
        name: 'Digg',
        color: '#000000',
        url: 'https://digg.com/submit?url={url}&title={title}',
        target: '_blank',
        category: 'social'
    },
    'stumbleupon': {
        name: 'StumbleUpon',
        color: '#eb4924',
        url: 'https://www.stumbleupon.com/submit?url={url}&title={title}',
        target: '_blank',
        category: 'social'
    },
    'flipboard': {
        name: 'Flipboard',
        color: '#e12828',
        url: 'https://share.flipboard.com/bookmarklet/popout?v=2&url={url}&title={title}',
        target: '_blank',
        category: 'social'
    },
    'mix': {
        name: 'Mix',
        color: '#ff8226',
        url: 'https://mix.com/add?url={url}',
        target: '_blank',
        category: 'social'
    },

    // Messaging Apps
    'kik': {
        name: 'Kik',
        color: '#82bc23',
        url: 'https://kik.me/{title}%20{url}',
        target: '_blank',
        category: 'messaging'
    },
    'threema': {
        name: 'Threema',
        color: '#3fe669',
        url: 'threema://compose?text={title}%20{url}',
        target: '_blank',
        category: 'messaging'
    },
    'signal': {
        name: 'Signal',
        color: '#3a76f0',
        url: 'https://signal.org/install/',
        target: '_blank',
        category: 'messaging'
    },

    // Shopping & E-commerce
    'amazon': {
        name: 'Amazon',
        color: '#ff9900',
        url: 'https://www.amazon.com/s?k={title}',
        target: '_blank',
        category: 'shopping'
    },
    'ebay': {
        name: 'eBay',
        color: '#e53238',
        url: 'https://www.ebay.com/sch/i.html?_nkw={title}',
        target: '_blank',
        category: 'shopping'
    },
    'etsy': {
        name: 'Etsy',
        color: '#d5641c',
        url: 'https://www.etsy.com/search?q={title}',
        target: '_blank',
        category: 'shopping'
    },

    // Educational & Academic
    'mendeley': {
        name: 'Mendeley',
        color: '#9d1620',
        url: 'https://www.mendeley.com/import/?url={url}',
        target: '_blank',
        category: 'academic'
    },
    'researchgate': {
        name: 'ResearchGate',
        color: '#00ccbb',
        url: 'https://www.researchgate.net/publication/new?url={url}',
        target: '_blank',
        category: 'academic'
    },
    'academia': {
        name: 'Academia',
        color: '#41454a',
        url: 'https://www.academia.edu/bookmarklet?url={url}',
        target: '_blank',
        category: 'academic'
    },

    // Finance & Crypto
    'coinbase': {
        name: 'Coinbase',
        color: '#0052ff',
        url: 'https://www.coinbase.com/share?url={url}',
        target: '_blank',
        category: 'finance'
    },

    // Travel & Lifestyle
    'foursquare': {
        name: 'Foursquare',
        color: '#f94877',
        url: 'https://foursquare.com/intent/venue?url={url}',
        target: '_blank',
        category: 'lifestyle'
    },
    'yelp': {
        name: 'Yelp',
        color: '#d32323',
        url: 'https://www.yelp.com/writeareview/biz/{title}',
        target: '_blank',
        category: 'lifestyle'
    },

    // Utility
    'copy-link': {
        name: 'Copy Link',
        color: '#28a745',
        url: '{url}',
        target: '_self',
        category: 'utility'
    },
    'print': {
        name: 'Print',
        color: '#6c757d',
        url: 'javascript:window.print()',
        target: '_self',
        category: 'utility'
    },
    'qr-code': {
        name: 'QR Code',
        color: '#000000',
        url: 'https://api.qrserver.com/v1/create-qr-code/?data={url}',
        target: '_blank',
        category: 'utility'
    }
};
