// modules/profile/components/resume/templates/MinimalTemplate.jsx
"use client";

import styles from "./MinimalTemplate.module.css";
import {
  Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar,
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

const MinimalTemplate = ({ resume }) => {
  const w = resume.work_experiences || [];
  const e = resume.educations || [];
  const s = resume.skills || [];
  const l = resume.languages || [];
  const c = resume.certificates || [];
  const p = resume.projects || [];
  const a = resume.awards || [];
  const i = resume.interests || [];

  return (
    <div className={styles.template} dir="rtl">
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.name}>{resume.full_name}</h1>
        {resume.job_title && (
          <p className={styles.jobTitle}>{resume.job_title}</p>
        )}

        <div className={styles.contactRow}>
          {resume.mobile && (
            <span className={styles.contactItem}>
              <Phone size={11} />
              <span dir="ltr">{resume.mobile}</span>
            </span>
          )}
          {resume.email && (
            <span className={styles.contactItem}>
              <Mail size={11} />
              <span dir="ltr">{resume.email}</span>
            </span>
          )}
          {resume.city_name && (
            <span className={styles.contactItem}>
              <MapPin size={11} />
              <span>{resume.city_name}</span>
            </span>
          )}
          {resume.website && (
            <span className={styles.contactItem}>
              <Globe size={11} />
              <span dir="ltr">{resume.website}</span>
            </span>
          )}
          {resume.linkedin && (
            <span className={styles.contactItem}>
              <Linkedin size={11} />
              <span dir="ltr">LinkedIn</span>
            </span>
          )}
          {resume.github && (
            <span className={styles.contactItem}>
              <Github size={11} />
              <span dir="ltr">GitHub</span>
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {resume.summary && (
        <section className={styles.section}>
          <p className={styles.summary}>{resume.summary}</p>
        </section>
      )}

      {/* Work Experience */}
      {w.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>سوابق شغلی</h2>
          {w.map((exp) => (
            <div key={exp.id} className={styles.item}>
              <div className={styles.itemRow}>
                <span className={styles.itemTitle}>{exp.job_title}</span>
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
          ))}
        </section>
      )}

      {/* Education */}
      {e.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>تحصیلات</h2>
          {e.map((edu) => (
            <div key={edu.id} className={styles.item}>
              <div className={styles.itemRow}>
                <span className={styles.itemTitle}>
                  {edu.degree_display} {edu.field_of_study}
                </span>
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

      {/* Skills */}
      {s.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>مهارت‌ها</h2>
          <div className={styles.skillsWrap}>
            {s.map((skill) => (
              <span key={skill.id} className={styles.skillChip}>
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {l.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>زبان‌ها</h2>
          <div className={styles.langsWrap}>
            {l.map((lang) => (
              <span key={lang.id} className={styles.langItem}>
                <strong>{lang.name}</strong>
                <span className={styles.langLevel}>{lang.level_display}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Certificates */}
      {c.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>دوره‌ها و گواهی‌نامه‌ها</h2>
          {c.map((cert) => (
            <div key={cert.id} className={styles.item}>
              <div className={styles.itemRow}>
                <span className={styles.itemTitle}>{cert.title}</span>
                {cert.issue_date && (
                  <span className={styles.itemDate}>
                    {formatDate(cert.issue_date)}
                  </span>
                )}
              </div>
              {cert.institution && (
                <p className={styles.itemSubtitle}>{cert.institution}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {p.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>پروژه‌ها</h2>
          {p.map((proj) => (
            <div key={proj.id} className={styles.item}>
              <div className={styles.itemRow}>
                <span className={styles.itemTitle}>{proj.title}</span>
                {proj.role && (
                  <span className={styles.itemDate}>{proj.role}</span>
                )}
              </div>
              {proj.description && (
                <p className={styles.itemDesc}>{proj.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Awards */}
      {a.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>افتخارات</h2>
          {a.map((award) => (
            <div key={award.id} className={styles.item}>
              <div className={styles.itemRow}>
                <span className={styles.itemTitle}>{award.title}</span>
                {award.date && (
                  <span className={styles.itemDate}>{formatDate(award.date)}</span>
                )}
              </div>
              {award.issuer && (
                <p className={styles.itemSubtitle}>{award.issuer}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Interests */}
      {i.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>علاقه‌مندی‌ها</h2>
          <div className={styles.skillsWrap}>
            {i.map((interest) => (
              <span key={interest.id} className={styles.skillChip}>
                {interest.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MinimalTemplate;