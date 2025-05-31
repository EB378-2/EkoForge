create table public.profiles (
  id uuid not null,
  fullname text not null,
  email text not null,
  phone_number text null,
  avatar_url text null,
  ratings jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  licence text null,
  status text null,
  role text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_email_key unique (email),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;


create table public.resources (
  id uuid not null default gen_random_uuid (),
  resource_type character varying(50) not null,
  name character varying(255) not null,
  image_link text null,
  status character varying(50) not null default 'available'::character varying,
  total_hours numeric(5, 2) not null default 0.0,
  hourly_rate numeric(5, 2) not null default 0.0,
  last_service numeric(5, 2) null default 0.0,
  next_service numeric(5, 2) null default 0.0,
  persons_responsible jsonb null,
  location text null,
  details jsonb null,
  notes text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint resources_pkey primary key (id),
  constraint resources_resource_type_check check (
    (
      (resource_type)::text = any (
        array[
          ('aircraft'::character varying)::text,
          ('simulator'::character varying)::text,
          ('classroom'::character varying)::text
        ]
      )
    )
  ),
  constraint resources_status_check check (
    (
      (status)::text = any (
        array[
          ('available'::character varying)::text,
          ('maintenance'::character varying)::text,
          ('INOP'::character varying)::text
        ]
      )
    )
  )
) TABLESPACE pg_default;



create table public.pn_forms (
  id serial not null,
  from_location character varying(50) not null,
  to_location character varying(50) not null,
  dep_time character(4) not null,
  arr_time character(4) not null,
  dep_date date null,
  arr_date date null,
  aircraft_reg character varying(20) not null,
  mtow integer not null,
  pic_name character varying(100) not null,
  phone character varying(30) not null,
  email character varying(100) not null,
  ifr_arrival boolean not null default false,
  status character varying(20) not null default 'pending'::character varying,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  uid uuid not null default auth.uid (),
  constraint pn_forms_pkey primary key (id),
  constraint pn_forms_uid_fkey foreign KEY (uid) references profiles (id),
  constraint pn_forms_dep_time_check check (
    (
      (dep_time >= '0600'::bpchar)
      and (dep_time <= '1800'::bpchar)
    )
  ),
  constraint pn_forms_email_check check (
    (
      (email)::text ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'::text
    )
  ),
  constraint pn_forms_arr_time_check check (
    (
      (arr_time >= '0600'::bpchar)
      and (arr_time <= '1800'::bpchar)
    )
  ),
  constraint pn_forms_status_check check (
    (
      (status)::text = any (
        (
          array[
            'pending'::character varying,
            'approved'::character varying,
            'rejected'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint pn_forms_mtow_check check (
    (
      (mtow >= 1)
      and (mtow <= 100000)
    )
  ),
  constraint pn_forms_check check ((arr_date >= dep_date))
) TABLESPACE pg_default;

create index IF not exists idx_pn_forms_dates on public.pn_forms using btree (dep_date, arr_date) TABLESPACE pg_default;

create index IF not exists idx_pn_forms_registration on public.pn_forms using btree (aircraft_reg) TABLESPACE pg_default;

create index IF not exists idx_pn_forms_pic on public.pn_forms using btree (pic_name) TABLESPACE pg_default;

create index IF not exists idx_pn_forms_status on public.pn_forms using btree (status) TABLESPACE pg_default;

create trigger update_pn_forms_modtime BEFORE
update on pn_forms for EACH row
execute FUNCTION update_modified_column ();


create table public.fuel (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  userid uuid not null default auth.uid (),
  aircraft text not null,
  amount integer not null,
  fuel text not null,
  constraint fuel_pkey primary key (id)
) TABLESPACE pg_default;



create table public.blogs (
  id uuid not null default gen_random_uuid (),
  profile_id uuid not null default auth.uid (),
  title character varying(255) not null,
  content text not null,
  image_link text null,
  published_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint blogs_pkey primary key (id),
  constraint fk_blog_author foreign KEY (profile_id) references profiles (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;


















CREATE TYPE report_status AS ENUM ('open', 'in-progress', 'resolved');
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE report_category AS ENUM ('inflight', 'infrastructure', 'aircraft', 'medical', 'security', 'enviromental', 'communication', 'other');

CREATE TABLE sms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category report_category NOT NULL,
    status report_status NOT NULL DEFAULT 'open',
    severity severity_level NOT NULL,
    reported_by UUID NOT NULL,  -- Or UUID if you have users table
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    location VARCHAR(255),  -- Optional location information
    comments JSONB  -- Array of comments/updates
);

-- Indexes for common queries
CREATE INDEX idx_reports_status ON sms (status);
CREATE INDEX idx_reports_category ON sms (category);
CREATE INDEX idx_reports_severity ON sms (severity);
CREATE INDEX idx_reports_created ON sms (reported_at);