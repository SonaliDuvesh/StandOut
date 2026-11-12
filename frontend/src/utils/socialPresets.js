export const PRESET_SOCIAL_LOGOS = {
    linkedin: { src: '/social/linkedin.png', pinkSrc: '/social/pink/linkedin.png' },
    github: { src: '/social/github.png', pinkSrc: '/social/pink/github.png' },
    medium: { src: '/social/medium.png', pinkSrc: '/social/pink/medium.png' },
    devpost: { src: '/social/devpost.png', pinkSrc: '/social/pink/devpost.png' },
    twitter: { src: '/social/twitter.svg', pinkSrc: '/social/twitter.svg' },
    x: { src: '/social/twitter.svg', pinkSrc: '/social/twitter.svg' },
    youtube: { src: '/social/youtube.svg', pinkSrc: '/social/youtube.svg' },
    instagram: { src: '/social/instagram.svg', pinkSrc: '/social/instagram.svg' },
    discord: { src: '/social/discord.svg', pinkSrc: '/social/discord.svg' },
    leetcode: { src: '/social/leetcode.svg', pinkSrc: '/social/leetcode.svg' },
    kaggle: { src: '/social/kaggle.svg', pinkSrc: '/social/kaggle.svg' },
    website: { src: '/social/website.svg', pinkSrc: '/social/website.svg' },
};

export const PRESET_PLATFORMS = [
    {
        id: 'medium',
        name: 'Medium',
        defaultUrl: 'https://medium.com/@',
        src: '/social/medium.png',
        pinkSrc: '/social/pink/medium.png',
        placeholder: 'https://medium.com/@username',
    },
    {
        id: 'devpost',
        name: 'Devpost',
        defaultUrl: 'https://devpost.com/',
        src: '/social/devpost.png',
        pinkSrc: '/social/pink/devpost.png',
        placeholder: 'https://devpost.com/username',
    },
    {
        id: 'github',
        name: 'GitHub',
        defaultUrl: 'https://github.com/',
        src: '/social/github.png',
        pinkSrc: '/social/pink/github.png',
        placeholder: 'https://github.com/username',
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        defaultUrl: 'https://www.linkedin.com/in/',
        src: '/social/linkedin.png',
        pinkSrc: '/social/pink/linkedin.png',
        placeholder: 'https://www.linkedin.com/in/username',
    },
    {
        id: 'twitter',
        name: 'Twitter / X',
        defaultUrl: 'https://x.com/',
        src: '/social/twitter.svg',
        pinkSrc: '/social/twitter.svg',
        placeholder: 'https://x.com/handle',
    },
    {
        id: 'youtube',
        name: 'YouTube',
        defaultUrl: 'https://youtube.com/@',
        src: '/social/youtube.svg',
        pinkSrc: '/social/youtube.svg',
        placeholder: 'https://youtube.com/@channel',
    },
    {
        id: 'instagram',
        name: 'Instagram',
        defaultUrl: 'https://instagram.com/',
        src: '/social/instagram.svg',
        pinkSrc: '/social/instagram.svg',
        placeholder: 'https://instagram.com/username',
    },
    {
        id: 'discord',
        name: 'Discord',
        defaultUrl: 'https://discord.gg/',
        src: '/social/discord.svg',
        pinkSrc: '/social/discord.svg',
        placeholder: 'https://discord.gg/invitecode',
    },
    {
        id: 'leetcode',
        name: 'LeetCode',
        defaultUrl: 'https://leetcode.com/u/',
        src: '/social/leetcode.svg',
        pinkSrc: '/social/leetcode.svg',
        placeholder: 'https://leetcode.com/u/username',
    },
    {
        id: 'kaggle',
        name: 'Kaggle',
        defaultUrl: 'https://kaggle.com/',
        src: '/social/kaggle.svg',
        pinkSrc: '/social/kaggle.svg',
        placeholder: 'https://kaggle.com/username',
    },
    {
        id: 'website',
        name: 'Personal Website',
        defaultUrl: 'https://',
        src: '/social/website.svg',
        pinkSrc: '/social/website.svg',
        placeholder: 'https://mywebsite.com',
    },
    {
        id: 'custom',
        name: 'Custom Platform...',
        defaultUrl: 'https://',
        src: '/social/website.svg',
        pinkSrc: '/social/website.svg',
        placeholder: 'https://destination-url.com',
    },
];

export const getFloatingPositionClass = (index, total) => {
    if (total <= 1) {
        return 'top-[22%] left-[22%] sm:top-[26%] sm:left-[26%]';
    }
    if (total === 2) {
        const slots = [
            'top-[10%] left-[10%] sm:top-[14%] sm:left-[12%]',
            'bottom-[12%] right-[10%] sm:bottom-[15%] sm:right-[12%]',
        ];
        return slots[index % 2];
    }
    if (total === 3) {
        const slots = [
            'top-[8%] left-[10%] sm:top-[12%] sm:left-[12%]',
            'top-[8%] right-[10%] sm:top-[12%] sm:right-[12%]',
            'bottom-[10%] left-[35%] sm:bottom-[12%] sm:left-[38%]',
        ];
        return slots[index % 3];
    }
    if (total === 4) {
        const slots = [
            'top-[8%] left-[8%] sm:top-[12%] sm:left-[10%]',
            'top-[6%] right-[8%] sm:top-[10%] sm:right-[10%]',
            'bottom-[10%] left-[8%] sm:bottom-[12%] sm:left-[10%]',
            'bottom-[8%] right-[8%] sm:bottom-[10%] sm:right-[10%]',
        ];
        return slots[index % 4];
    }
    const slots = [
        'top-[6%] left-[8%] sm:top-[8%] sm:left-[10%]',
        'top-[5%] right-[8%] sm:top-[7%] sm:right-[10%]',
        'bottom-[8%] left-[8%] sm:bottom-[10%] sm:left-[10%]',
        'bottom-[6%] right-[8%] sm:bottom-[8%] sm:right-[10%]',
        'top-[42%] left-[3%] sm:top-[44%] sm:left-[5%]',
        'top-[40%] right-[3%] sm:top-[42%] sm:right-[5%]',
        'top-[4%] left-[40%] sm:top-[6%] sm:left-[43%]',
        'bottom-[4%] left-[40%] sm:bottom-[6%] sm:left-[43%]',
    ];
    return slots[index % slots.length];
};

