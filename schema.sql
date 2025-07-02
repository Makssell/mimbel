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