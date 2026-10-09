// modules/profile/components/resume/templates/CreativeTemplate.jsx
"use client";

import styles from "./CreativeTemplate.module.css";
import {
  Mail, Phone, MapPin, Globe, Linkedin, Github, Star, Award,
} from "lucide-react";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

const formatDate = (date) => {
  if (!date) return "";
  try {
    return moment(date).format("jYYYY/jMM");
  } catch {
    return date;
  }
};

const CreativeTemplate = ({ resume }) => {
  const w = resume.work_experiences || [];
  const e = resume.educations || [];
  const s = resume.skills || [];
  const l = resume.languages || [];
  const c = resume.certificates || [];
  const p = resume.projects || [];
  const a = resume.awards || [];
  const i = resume.interests || [];

  const renderSkillDots = (level) =>
    Array.from({ length: 5 }).map((_, idx) => (
      <span
        key={idx}
        className={`${styles.dot} ${idx < level ? styles.dotFilled : ""}`}
      />
    ));

  return (
    <div className={styles.template} dir="rtl">
      {/* Hero Header */}
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          {resume.image_url && (
            <img
              src={resume.image_url}
              alt={resume.full_name}
              className={styles.avatar}
            />
          )}
          <div className={styles.heroText}>
            <h1 className={styles.name}>{resume.full_name}</h1>
            {resume.job_title && (
              <p className={styles.jobTitle}>{resume.job_title}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Bar */}
      <div className={styles.contactBar}>
        {resume.mobile && (
          <span className={styles.contactItem}>
            <Phone size={12} />
            <span dir="ltr">{resume.mobile}</span>
          </span>
        )}
        {resume.email && (
          <span className={styles.contactItem}>
            <Mail size={12} />
            <span dir="ltr">{resume.email}</span>
          </span>
        )}
        {resume.city_name && (
          <span className={styles.contactItem}>
            <MapPin size={12} />
            {resume.city_name}
          </span>
        )}
        {resume.linkedin && (
          <span className={styles.contactItem}>
            <Linkedin size={12} />
            LinkedIn
          </span>
        )}
      </div>

      <div className={styles.body}>
        {/* Left column (main) */}
        <div className={styles.mainCol}>
          {resume.summary && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleDecor} />
                درباره من
              </h2>
              <p className={styles.summary}>{resume.summary}</p>
            </section>
          )}

          {w.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleDecor} />
                سوابق شغلی
              </h2>
              <div className={styles.timeline}>
                {w.map((exp) => (
                  <div key={exp.id} className={styles.timelineItem}>
                    <div className={styles.timelineDot} />
                    <div className={styles.timelineContent}>
                      <div className={styles.itemHeader}>
                        <h3 className={styles.itemTitle}>{exp.job_title}</h3>
                        <span className={styles.itemDate}>
                          {formatDate(exp.start_date)} —{" "}
                          {exp.is_current ? "تاکنون" : formatDate(exp.end_date)}
                        </span>
                      </div>
                      <p className={styles.itemSubtitle}>
                        {exp.company_name}
                        {exp.city_name && ` • ${exp.city_name}`}
                      </p>
                      {exp.description && (
                        <p className={styles.itemDesc}>{exp.description}</p>
                      )}
                      {exp.achievements && (
                        <ul className={styles.achievements}>
                          {exp.achievements.split("\n").filter(Boolean).map((ach, idx) => (
                            <li key={idx}>{ach}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {p.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleDecor} />
                پروژه‌ها
              </h2>
              <div className={styles.projectsGrid}>
                {p.map((proj) => (
                  <div key={proj.id} className={styles.projectCard}>
                    <h3>{proj.title}</h3>
                    {proj.role && (
                      <span className={styles.projectRole}>{proj.role}</span>
                    )}
                    {proj.description && <p>{proj.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {e.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.titleDecor} />
                تحصیلات
              </h2>
              {e.map((edu) => (
                <div key={edu.id} className={styles.itemSimple}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemTitle}>
                      {edu.degree_display} {edu.field_of_study}
                    </h3>
                    <span className={styles.itemDate}>
                      {formatDate(edu.start_date)} —{" "}
                      {edu.is_current ? "در حال تحصیل" : formatDate(edu.end_date)}
                    </span>
                  </div>
                  <p className={styles.itemSubtitle}>
                    {edu.institution}
                    {edu.gpa && ` • معدل: ${edu.gpa}`}
                  </p>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Right column (sidebar) */}
        <aside className={styles.sideCol}>
          {s.length > 0 && (
            <section className={styles.sideSection}>
              <h3 className={styles.sideTitle}>مهارت‌ها</h3>
              <div className={styles.skillsList}>
                {s.map((skill) => (
                  <div key={skill.id} className={styles.skillItem}>
                    <div className={styles.skillHeader}>
                      <span className={styles.skillName}>{skill.name}</span>
                      <div className={styles.skillDots}>
                        {renderSkillDots(skill.level)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {l.length > 0 && (
            <section className={styles.sideSection}>
              <h3 className={styles.sideTitle}>زبان‌ها</h3>
              <div className={styles.langsList}>
                {l.map((lang) => (
                  <div key={lang.id} className={styles.langItem}>
                    <span className={styles.langName}>{lang.name}</span>
                    <span className={styles.langLevel}>{lang.level_display}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {c.length > 0 && (
            <section className={styles.sideSection}>
              <h3 className={styles.sideTitle}>دوره‌ها</h3>
              <div className={styles.certsList}>
                {c.map((cert) => (
                  <div key={cert.id} className={styles.certItem}>
                    <strong>{cert.title}</strong>
                    {cert.institution && <span>{cert.institution}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {a.length > 0 && (
            <section className={styles.sideSection}>
              <h3 className={styles.sideTitle}>افتخارات</h3>
              <div className={styles.certsList}>
                {a.map((award) => (
                  <div key={award.id} className={styles.certItem}>
                    <strong>{award.title}</strong>
                    {award.issuer && <span>{award.issuer}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {i.length > 0 && (
            <section className={styles.sideSection}>
              <h3 className={styles.sideTitle}>علاقه‌مندی‌ها</h3>
              <div className={styles.tagsWrap}>
                {i.map((interest) => (
                  <span key={interest.id} className={styles.tag}>
                    {interest.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};

export default CreativeTemplate;