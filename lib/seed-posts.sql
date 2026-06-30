INSERT INTO public.posts (
    title,
    content,
    main_image,
    user_id,
    sub_content,
    sub_images,
    active
)
SELECT
    (
        ARRAY[
            'Top 10 React Tips Every Developer Should Know',
            'Getting Started with Next.js App Router',
            'Why TypeScript Improves Code Quality',
            'Building Modern Dashboards with React',
            'Understanding Server Components',
            'Supabase Authentication Made Easy',
            'How to Structure Large Frontend Projects',
            'Best Practices for API Integration',
            'Creating Responsive Layouts with Tailwind CSS',
            'Improving Application Performance'
        ]
    )[floor(random() * 10 + 1)],

    (
        ARRAY[
            'In this article we explore practical techniques that can help developers write cleaner and more maintainable code.',
            'Learn how modern web technologies simplify application development and improve user experience.',
            'This guide covers common patterns and solutions used in production applications.',
            'Discover useful tips and workflows that can increase productivity and reduce bugs.',
            'A complete overview of tools and techniques used by modern frontend teams.'
        ]
    )[floor(random() * 5 + 1)],

    'https://picsum.photos/seed/post' || gs || '/1200/800',

    'd2d8b48b-b058-4918-a25a-63eae1daf88d'::uuid,

    (
        ARRAY[
            'Additional technical insights and implementation details.',
            'Examples and code snippets are included for better understanding.',
            'Real-world use cases demonstrate how these concepts are applied.',
            'Recommendations based on industry best practices.',
            'Further resources and references for deeper learning.'
        ]
    )[floor(random() * 5 + 1)],

    jsonb_build_array(
        'https://picsum.photos/seed/gallery' || gs || 'a/600/400',
        'https://picsum.photos/seed/gallery' || gs || 'b/600/400',
        'https://picsum.photos/seed/gallery' || gs || 'c/600/400'
    ),

    random() > 0.15

FROM generate_series(1, 10) gs;