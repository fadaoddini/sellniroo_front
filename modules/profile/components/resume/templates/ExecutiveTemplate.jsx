// modules/profile/components/resume/templates/ExecutiveTemplate.jsx
"use client";

import styles from "./ExecutiveTemplate.module.css";
import {
  Mail, Phone, MapPin, Globe, Linkedin, Calendar,
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

const ExecutiveTemplate = ({ resume }) => {
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
        <div className={styles.headerTop}>
          <div className={styles.headerLeft}>
            <h1 className={styles.name}>{resume.full_name}</h1>
            {resume.job_title && (
              <p className={styles.jobTitle}>{resume.job_title}</p>
            )}
          </div>
          {resume.image_url && (
            <img
              src={resume.image_url}
              alt={resume.full_name}
              className={styles.avatar}
            />
          )}
        </div>

        <div className={styles.contactBar}>
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
              {resume.city_name}
            </span>
          )}
          {resume.linkedin && (
            <span className={styles.contactItem}>
              <Linkedin size={11} />
              LinkedIn
            </span>
          )}
          {resume.website && (
            <span className={styles.contactItem}>
              <Globe size={11} />
              <span dir="ltr">{resume.website}</span>
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {resume.summary && (
        <div className={styles.summaryBox}>
          <p>{resume.summary}</p>
        </div>
      )}

      {/* Two-column layout */}
      <div className={styles.content}>
        <div className={styles.mainCol}>
          {/* Work Experience */}
          {w.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.num}>01</span>
                سوابق شغلی
              </h2>
              {w.map((exp) => (
                <div key={exp.id} className={styles.expItem}>
                  <div className={styles.expHeader}>
                    <div>
                      <h3 className={styles.expTitle}>{exp.job_title}</h3>
                      <p className={styles.expCompany}>
                        {exp.company_name}
                        {exp.city_name && ` • ${exp.city_name}`}
                      </p>
                    </div>
                    <span className={styles.expDate}>
                      {formatDate(exp.start_date)} —{" "}
                      {exp.is_current ? "تاکنون" : formatDate(exp.end_date)}
                    </span>
                  </div>
                  {exp.description && (
                    <p className={styles.expDesc}>{exp.description}</p>
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

          {/* Projects */}
          {p.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.num}>02</span>
                پروژه‌ها
              </h2>
              {p.map((proj) => (
                <div key={proj.id} className={styles.simpleItem}>
                  <div className={styles.simpleHeader}>
                    <h3>{proj.title}</h3>
                    {proj.role && <span className={styles.role}>{proj.role}</span>}
                  </div>
                  {proj.description && <p>{proj.description}</p>}
                </div>
              ))}
            </section>
          )}
        </div>

        <aside className={styles.sideCol}>
          {/* Education */}
          {e.length > 0 && (
            <section className={styles.sideSection}>
              <h2 className={styles.sideTitle}>تحصیلات</h2>
              {e.map((edu) => (
                <div key={edu.id} className={styles.eduItem}>
                  <h4>{edu.degree_display}</h4>
                  <p className={styles.eduField}>{edu.field_of_study}</p>
                  <p className={styles.eduInst}>{edu.institution}</p>
                  <span className={styles.eduDate}>
                    {formatDate(edu.start_date)} —{" "}
                    {edu.is_current ? "در حال تحصیل" : formatDate(edu.end_date)}
                  </span>
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          {s.length > 0 && (
            <section className={styles.sideSection}>
              <h2 className={styles.sideTitle}>مهارت‌ها</h2>
              <div className={styles.skillsList}>
                {s.map((skill) => (
                  <div key={skill.id} className={styles.skillRow}>
                    <span className={styles.skillName}>{skill.name}</span>
                    <div className={styles.skillBar}>
                      <div
                        className={styles.skillBarFill}
                        style={{ width: `${(skill.level / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {l.length > 0 && (
            <section className={styles.sideSection}>
              <h2 className={styles.sideTitle}>زبان‌ها</h2>
              <ul className={styles.simpleList}>
                {l.map((lang) => (
                  <li key={lang.id}>
                    <strong>{lang.name}</strong>
                    <span>{lang.level_display}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Certificates */}
          {c.length > 0 && (
            <section className={styles.sideSection}>
              <h2 className={styles.sideTitle}>دوره‌ها</h2>
              <ul className={styles.simpleList}>
                {c.map((cert) => (
                  <li key={cert.id}>
                    <strong>{cert.title}</strong>
                    {cert.institution && <span>{cert.institution}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Awards */}
          {a.length > 0 && (
            <section className={styles.sideSection}>
              <h2 className={styles.sideTitle}>افتخارات</h2>
              <ul className={styles.simpleList}>
                {a.map((award) => (
                  <li key={award.id}>
                    <strong>{award.title}</strong>
                    {award.issuer && <span>{award.issuer}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ExecutiveTemplate;