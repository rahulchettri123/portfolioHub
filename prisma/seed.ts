import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9.m', // password: test123
      name: 'Test User',
      title: 'Full Stack Developer',
      bio: 'A passionate developer',
      location: 'San Francisco, CA',
      githubUrl: 'https://github.com/testuser',
      linkedinUrl: 'https://linkedin.com/in/testuser',
      twitterUrl: 'https://twitter.com/testuser',
      websiteUrl: 'https://testuser.com',
    },
  });

  // Create experiences
  const experiences = [
    {
      jobTitle: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      description: 'Leading development of core products',
      startDate: new Date('2020-01-01'),
      current: true,
      order: 1,
      userId: user.id,
    },
    {
      jobTitle: 'Software Engineer',
      company: 'Startup Inc',
      location: 'San Francisco, CA',
      description: 'Developed and maintained web applications',
      startDate: new Date('2018-01-01'),
      endDate: new Date('2019-12-31'),
      order: 2,
      userId: user.id,
    },
  ];

  for (const experience of experiences) {
    await prisma.experience.create({
      data: experience,
    });
  }

  // Create education entries
  const educations = [
    {
      universityName: 'University of Technology',
      location: 'San Francisco, CA',
      degree: 'Bachelor of Science in Computer Science',
      startDate: new Date('2014-09-01'),
      endDate: new Date('2018-05-31'),
      gpa: '3.8',
      courses: ['Data Structures', 'Algorithms', 'Web Development'],
      order: 1,
      userId: user.id,
    },
  ];

  for (const education of educations) {
    await prisma.education.create({
      data: education,
    });
  }

  // Create projects
  const projects = [
    {
      title: 'Portfolio Website',
      description: 'A modern portfolio website built with Next.js',
      techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
      tags: ['Web Development', 'Frontend'],
      githubUrl: 'https://github.com/testuser/portfolio',
      demoUrl: 'https://portfolio.testuser.com',
      date: new Date('2024-01-01'),
      imageUrl: 'https://example.com/portfolio.jpg',
      imageLinkTo: 'github',
      userId: user.id,
    },
  ];

  for (const project of projects) {
    await prisma.project.create({
      data: project,
    });
  }

  // Create blog posts
  const blogs = [
    {
      title: 'Getting Started with Next.js',
      description: 'Learn how to build modern web applications with Next.js',
      location: 'San Francisco, CA',
      eventDate: new Date('2024-02-01'),
      skillsLearned: ['Next.js', 'React', 'TypeScript'],
      images: ['https://example.com/blog1.jpg'],
      userId: user.id,
    },
  ];

  for (const blog of blogs) {
    await prisma.blog.create({
      data: blog,
    });
  }

  console.log('Database has been seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 