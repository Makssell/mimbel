-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.continents (
  name text NOT NULL UNIQUE,
  id integer NOT NULL DEFAULT nextval('continents_id_seq'::regclass),
  CONSTRAINT continents_pkey PRIMARY KEY (id)
);

CREATE TABLE public.country_continent (
  country_id integer NOT NULL,
  continent_id integer NOT NULL,
  CONSTRAINT country_continent_pkey PRIMARY KEY (country_id, continent_id),
  CONSTRAINT country_continent_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.flags(id),
  CONSTRAINT country_continent_continent_id_fkey FOREIGN KEY (continent_id) REFERENCES public.continents(id)
);

CREATE TABLE public.flags (
  name text NOT NULL UNIQUE,
  territory boolean NOT NULL,
  image_url text,
  id integer NOT NULL DEFAULT nextval('flags_id_seq'::regclass),
  fileName text,
  CONSTRAINT flags_pkey PRIMARY KEY (id)
);

-- Regional flag countries (root nodes for subdivisions)
CREATE TABLE public.regional_flag_countries (
  id integer NOT NULL DEFAULT nextval('regional_flag_countries_id_seq'::regclass),
  name character varying(100) NOT NULL UNIQUE,
  flag_image_url character varying NOT NULL,
  is_active boolean DEFAULT TRUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT regional_flag_countries_pkey PRIMARY KEY (id)
);

-- Subdivision layers per country (e.g., States, Territories, Provinces)
CREATE TABLE public.region_division_types (
  id integer NOT NULL DEFAULT nextval('region_division_types_id_seq'::regclass),
  country_id integer NOT NULL,
  type_name character varying(100) NOT NULL,
  is_active boolean DEFAULT TRUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT region_division_types_pkey PRIMARY KEY (id),
  CONSTRAINT region_division_types_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.regional_flag_countries(id) ON DELETE CASCADE,
  CONSTRAINT region_division_types_country_name_unique UNIQUE(country_id, type_name)
);

-- Regional flags (subdivisions) with metadata
CREATE TABLE public.regional_flags (
  id integer NOT NULL DEFAULT nextval('regional_flags_id_seq'::regclass),
  country_id integer NOT NULL,
  division_type_id integer NOT NULL,
  name character varying(100) NOT NULL,
  image_url character varying NOT NULL,
  abbreviation character varying(10),
  code character varying(20),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT regional_flags_pkey PRIMARY KEY (id),
  CONSTRAINT regional_flags_division_type_id_fkey FOREIGN KEY (division_type_id) REFERENCES public.region_division_types(id) ON DELETE CASCADE,
  CONSTRAINT regional_flags_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.regional_flag_countries(id) ON DELETE CASCADE,
  CONSTRAINT regional_flags_country_layer_name_unique UNIQUE(country_id, division_type_id, name)
);

-- Indexes for better performance
CREATE INDEX idx_regional_flags_country_id ON public.regional_flags(country_id);
CREATE INDEX idx_regional_flags_division_type_id ON public.regional_flags(division_type_id);
CREATE INDEX idx_region_division_types_country_id ON public.region_division_types(country_id);

-- Enable Row Level Security (RLS) on tables
ALTER TABLE public.continents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_continent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_flag_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.region_division_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anonymous read access
-- Allow anonymous users to read all continents
CREATE POLICY "Allow anonymous read access to continents" ON public.continents
  FOR SELECT USING (true);

-- Allow anonymous users to read all country_continent relationships
CREATE POLICY "Allow anonymous read access to country_continent" ON public.country_continent
  FOR SELECT USING (true);

-- Allow anonymous users to read all flags
CREATE POLICY "Allow anonymous read access to flags" ON public.flags
  FOR SELECT USING (true);

-- Allow anonymous users to read active regional flag countries
CREATE POLICY "Allow anonymous read access to active regional flag countries" ON public.regional_flag_countries
  FOR SELECT USING (is_active = true);

-- Allow anonymous users to read active region division types
CREATE POLICY "Allow anonymous read access to active region division types" ON public.region_division_types
  FOR SELECT USING (is_active = true);

-- Allow anonymous users to read all regional flags
CREATE POLICY "Allow anonymous read access to regional flags" ON public.regional_flags
  FOR SELECT USING (true);

-- Admin policies (for authenticated admin users)
-- These policies allow full CRUD access for admin users
-- You'll need to implement proper admin authentication in your app

-- Admin can do everything on continents
CREATE POLICY "Allow admin full access to continents" ON public.continents
  FOR ALL USING (auth.role() = 'admin');

-- Admin can do everything on country_continent
CREATE POLICY "Allow admin full access to country_continent" ON public.country_continent
  FOR ALL USING (auth.role() = 'admin');

-- Admin can do everything on flags
CREATE POLICY "Allow admin full access to flags" ON public.flags
  FOR ALL USING (auth.role() = 'admin');

-- Admin can do everything on regional_flag_countries
CREATE POLICY "Allow admin full access to regional_flag_countries" ON public.regional_flag_countries
  FOR ALL USING (auth.role() = 'admin');

-- Admin can do everything on region_division_types
CREATE POLICY "Allow admin full access to region_division_types" ON public.region_division_types
  FOR ALL USING (auth.role() = 'admin');

-- Admin can do everything on regional_flags
CREATE POLICY "Allow admin full access to regional_flags" ON public.regional_flags
  FOR ALL USING (auth.role() = 'admin');