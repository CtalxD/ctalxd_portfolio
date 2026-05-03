// app/projects/page.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./page.module.css";

interface ProjectsPageProps {
  isActive?: boolean;
}

export default function ProjectsPage({ isActive = false }: ProjectsPageProps) {
  const [contentVisible, setContentVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setContentVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setContentVisible(false);
    }
  }, [isActive]);

  const projects = [
    {
      id: 1,
      title: "Project Alpha",
      category: "Web Application",
      description: "A full-stack web application built with Next.js and Node.js",
      year: "2024",
    },
    {
      id: 2,
      title: "Project Beta",
      category: "Mobile App",
      description: "Cross-platform mobile application using React Native",
      year: "2023",
    },
    {
      id: 3,
      title: "Project Gamma",
      category: "UI/UX Design",
      description: "Complete design system for enterprise application",
      year: "2023",
    },
    {
      id: 4,
      title: "Project Delta",
      category: "Web Development",
      description: "E-commerce platform with custom CMS integration",
      year: "2022",
    },
  ];

  return (
    <section ref={sectionRef} className={`${styles.container} ${isActive ? styles.containerVisible : ''}`}>
      <div className={styles.content}>
        <div className={`${styles.header} ${contentVisible ? styles.visible : ""}`}>
          <h2 className={styles.title}>Selected Projects</h2>
          <p className={styles.subtitle}>A collection of work that i&apos;m proud of</p>
        </div>

        <div className={styles.projectsGrid}>
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`${styles.projectCard} ${
                contentVisible ? styles.visible : ""
              }`}
              style={{ transitionDelay: `${index * 0.15}s` }}
            >
              <div className={styles.projectContent}>
                <span className={styles.projectYear}>{project.year}</span>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <span className={styles.projectCategory}>{project.category}</span>
                <p className={styles.projectDescription}>{project.description}</p>
              </div>
              <div className={styles.projectArrow}>→</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}