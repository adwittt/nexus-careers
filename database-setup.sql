-- ============================================================
-- Nexus Careers — MySQL Database Setup & Sample Data
-- Run this script as a MySQL root user
-- ============================================================

-- ── 1. Create databases (one per microservice) ────────────────────────────
CREATE DATABASE nexus_auth_db;
CREATE DATABASE nexus_job_db;
CREATE DATABASE nexus_application_db;

-- ── 2. Tables are auto-created by Hibernate (ddl-auto: update)
--       Just connect to each DB and run sample data after services start.

-- ============================================================
-- SAMPLE DATA — connect to nexus_auth_db first
-- ============================================================
USE nexus_auth_db;

-- BCrypt hash of "password123" — use Spring's BCryptPasswordEncoder to generate fresh hashes
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO users (name, email, password, role, phone, is_active)
VALUES
  ('Super Admin',    'admin@nexus.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN',      '9000000000', true),
  ('Rahul Recruiter','recruiter@google.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'RECRUITER',  '9000000001', true),
  ('Priya Recruiter','recruiter@amazon.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'RECRUITER',  '9000000002', true),
  ('Jane Seeker',    'jane@gmail.com',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'JOB_SEEKER', '9000000003', true),
  ('Arjun Seeker',   'arjun@gmail.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'JOB_SEEKER', '9000000004', true);

-- All passwords: "password123"

-- ============================================================
-- SAMPLE DATA — connect to nexus_job_db
-- ============================================================
USE nexus_job_db;

INSERT INTO jobs (title, company_name, location, salary, experience, description, job_type, posted_by, recruiter_name, is_active)
VALUES
  ('Software Engineer',
   'Google', 'Bangalore', '15 LPA', '3-5 Years',
   'Join Google''s engineering team to build scalable distributed systems. You will work on challenging problems at massive scale, collaborating with world-class engineers. Responsibilities include designing, implementing, and maintaining backend services, participating in code reviews, and contributing to architectural decisions.',
   'FULL_TIME', 2, 'Rahul Recruiter', true),

  ('Backend Developer',
   'Amazon', 'Hyderabad', '20 LPA', '2-4 Years',
   'Amazon is looking for a talented Backend Developer to join our AWS team. You will design and implement RESTful APIs, work with microservices architecture, and contribute to our cloud infrastructure. Strong knowledge of Java, Spring Boot, and distributed systems required.',
   'FULL_TIME', 2, 'Rahul Recruiter', true),

  ('Frontend Engineer',
   'Microsoft', 'Bangalore', '18 LPA', '1-3 Years',
   'Build beautiful and responsive web applications for Microsoft 365. You will work with React, TypeScript, and modern web technologies to create user experiences used by millions of people worldwide. Proficiency in HTML5, CSS3, JavaScript ES6+ required.',
   'REMOTE', 3, 'Priya Recruiter', true),

  ('Full Stack Developer',
   'Meta', 'Bangalore', '22 LPA', '3-6 Years',
   'Join Meta to work on the next generation of social applications. As a Full Stack Developer, you will build end-to-end features for billions of users. Experience with React, Node.js, GraphQL, and large-scale databases required.',
   'FULL_TIME', 3, 'Priya Recruiter', true),

  ('DevOps Engineer',
   'Infosys', 'Pune', '12 LPA', '2-4 Years',
   'We are looking for a DevOps Engineer to help us build and maintain our CI/CD pipelines and cloud infrastructure. You will work with Docker, Kubernetes, Jenkins, and AWS/Azure to ensure high availability and reliability of our systems.',
   'FULL_TIME', 2, 'Rahul Recruiter', true),

  ('Data Scientist',
   'Wipro', 'Chennai', '14 LPA', '1-3 Years',
   'Exciting opportunity for a Data Scientist to join our AI/ML team. You will develop machine learning models, analyze large datasets, and derive actionable insights. Proficiency in Python, TensorFlow/PyTorch, and SQL required.',
   'FULL_TIME', 3, 'Priya Recruiter', true);

-- Insert required skills for each job
-- Job 1: Software Engineer at Google
INSERT INTO job_skills (job_id, skill) VALUES
  (1, 'Java'), (1, 'Spring Boot'), (1, 'Microservices'), (1, 'PostgreSQL'), (1, 'Docker');

-- Job 2: Backend Developer at Amazon
INSERT INTO job_skills (job_id, skill) VALUES
  (2, 'Java'), (2, 'AWS'), (2, 'REST APIs'), (2, 'Kafka'), (2, 'Redis');

-- Job 3: Frontend Engineer at Microsoft
INSERT INTO job_skills (job_id, skill) VALUES
  (3, 'React'), (3, 'TypeScript'), (3, 'CSS'), (3, 'JavaScript'), (3, 'Webpack');

-- Job 4: Full Stack Developer at Meta
INSERT INTO job_skills (job_id, skill) VALUES
  (4, 'React'), (4, 'Node.js'), (4, 'GraphQL'), (4, 'MongoDB'), (4, 'TypeScript');

-- Job 5: DevOps Engineer
INSERT INTO job_skills (job_id, skill) VALUES
  (5, 'Docker'), (5, 'Kubernetes'), (5, 'Jenkins'), (5, 'AWS'), (5, 'Terraform');

-- Job 6: Data Scientist
INSERT INTO job_skills (job_id, skill) VALUES
  (6, 'Python'), (6, 'TensorFlow'), (6, 'SQL'), (6, 'Pandas'), (6, 'Scikit-learn');

-- ============================================================
-- SAMPLE DATA — connect to nexus_application_db
-- ============================================================
USE nexus_application_db;

INSERT INTO applications (user_id, job_id, applicant_name, applicant_email, job_title, company_name, cover_letter, status)
VALUES
  (4, 1, 'Jane Seeker', 'jane@gmail.com',  'Software Engineer',  'Google',
   'I am extremely passionate about distributed systems and have 3 years of experience with Java and Spring Boot. I would love to contribute to Google''s engineering excellence.',
   'APPLIED'),

  (4, 3, 'Jane Seeker', 'jane@gmail.com',  'Frontend Engineer',  'Microsoft',
   'I have been working with React for 2 years and am proficient in TypeScript. I am excited about building world-class user interfaces at Microsoft.',
   'UNDER_REVIEW'),

  (5, 1, 'Arjun Seeker', 'arjun@gmail.com', 'Software Engineer', 'Google',
   'I am a backend developer with 4 years of experience. Java and microservices are my forte and I would be a great fit for this role.',
   'SHORTLISTED'),

  (5, 2, 'Arjun Seeker', 'arjun@gmail.com', 'Backend Developer', 'Amazon',
   'AWS is my area of expertise. I have built several production systems on AWS and would bring that knowledge to Amazon''s backend team.',
   'REJECTED');
