--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: PasswordResetToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PasswordResetToken" (
    id text NOT NULL,
    token text NOT NULL,
    email text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PasswordResetToken" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    username text NOT NULL,
    email text,
    phone text,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "avatarUrl" text,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: PasswordResetToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PasswordResetToken" (id, token, email, "createdAt", "expiresAt") FROM stdin;
b33b994d-5a12-42bf-888c-f43bfc45ea14	60db53bb66120a7f8b4526ff538241ef4fe0fc2419cd74c458e05b16344db865	adilkhan.ye@gmail.com	2025-08-11 15:13:30.886	2025-08-11 16:13:30.884
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, username, email, phone, password, "createdAt", "avatarUrl", "updatedAt") FROM stdin;
a4c0b70b-af7a-45d7-acd3-f9dedac35e99	Yerzhan	23795096@qq.com	\N	$2b$10$Y/qIFx5SBjZKdwyl1uMaquMsGq3MnZzFhXdo6JLy4air0xKlb5.Gq	2025-07-29 09:21:51.404	\N	2025-08-10 11:14:14.583
3b028251-6508-4640-b176-e1e191a1e570	Yerzhan	adilkhan.ye@gmail.com	\N	$2b$10$1L0iZ9kvZh8Ko7epL7o/vOgALkwdtWClG/vb/RDcRryoybVlm96a2	2025-07-29 09:15:44.578	\N	2025-08-10 11:14:14.583
796e86dc-3e94-4829-aa13-51dcaddaaa95	Ержан	23795097@qq.com	\N	$2b$10$uBxPl7IxTxbPZHZhbN/V4O0BalTMsI3/8VqpEdgeI.0QkWZBMRZXe	2025-08-11 16:37:39.189	\N	2025-08-11 16:37:39.189
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
66bb3d7d-2761-4b54-aef1-042f7f89bfbf	6c4b43cdc2670220a628838235367d3432cd7560d0386184296b2d3846f80328	2025-07-29 11:31:01.431516+05	20250729063101_add_username	\N	\N	2025-07-29 11:31:01.396489+05	1
ef26067a-910a-4ab7-a853-def833da45d9	2a49f1241d69d764863246b8be472bc0d3285c29de876a95a8474a67dabf7466	2025-08-10 11:14:14.595594+05	20250810061414_add_avatar_updated_at	\N	\N	2025-08-10 11:14:14.580789+05	1
\.


--
-- Name: PasswordResetToken PasswordResetToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PasswordResetToken"
    ADD CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: PasswordResetToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON public."PasswordResetToken" USING btree (token);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_phone_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_phone_key" ON public."User" USING btree (phone);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

