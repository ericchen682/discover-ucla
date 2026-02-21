# discover ucla

centralized hub to track events in and around ucla<br><br>
[check it out](https://discover-ucla.vercel.app/)

## features

- calendar displaying upcoming events
- filter events by category (academic, athletic, club, social, cultural, arts, volunteer, other)
- admin interface to add events without code changes

## tech

- **frontend**: next.js 14 with typescript
- **backend/db**: supabase (postgres)
- **styling**: tailwind
- **calendar**: react-big-calendar

## usage

### viewing events

- visit homepage to see calendar
- use filter buttons to show events by category
- click on an event to see details

### adding events (admin)

1. go to `/admin`
2. enter admin password
3. fill out the event form
4. submit to add the event to the calendar

## project structure

```
discover-ucla/
├── app/                    # next.js app directory
│   ├── page.tsx           # main calendar page
│   ├── admin/             # admin routes
│   │   └── page.tsx       # admin form page
│   └── api/               # api routes
│       ├── events/        # public events api
│       └── admin/         # admin api routes
├── components/
│   ├── Calendar.tsx       # calendar component
│   ├── EventCard.tsx      # event display card
│   ├── FilterBar.tsx      # category filter
│   └── AdminForm.tsx      # admin form
├── lib/
│   ├── supabase.ts        # supabase client
│   └── types.ts           # typescript types
└── public/                # static assets
```

## future enhancements

- user authentication for event hosts
- instagram scraping automation
- rsvp functionality
- event recommendations based on user preferences
- buddy system for event attendance
