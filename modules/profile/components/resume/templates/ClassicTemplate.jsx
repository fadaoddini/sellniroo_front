// modules/profile/components/resume/templates/ClassicTemplate.jsx
"use client";

import styles from "./ClassicTemplate.module.css";
import {
  Mail, Phone, MapPin, Globe, Linkedin, Github,
  Calendar, User, Briefcase, GraduationCap,
  Award, Star, Heart,
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

const ClassicTemplate = ({ resume }) => {
  const w = resume.work_experiences || [];
  const e = resume.educations || [];
  const s = resume.skills || [];
  const l = resume.languages || [];
  const c = resume.certificates || [];
  const p = resume.projects || [];
  const a = resume.awards || [];
  const i = resume.interests || [];

  const renderSkillBar = (level) => {
    const percentage = (level / 5) * 100;
    return (
      <div className={styles.skillBar}>
        <div
          className={styles.skillBarFill}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  return (
    <div className={styles.template} dir="rtl">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          {resume.image_url && (
            <img
              src={resume.image_url}
              alt={resume.full_name}
              className={styles.profileImage}
            />
          )}
          <div className={styles.headerText}>
            <h1 className={styles.name}>{resume.full_name}</h1>
            {resume.job_title && (
              <p className={styles.jobTitle}>{resume.job_title}</p>
            )}
            <div className={styles.contactLine}>
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
              {resume.linkedin && (
                <span className={styles.contactItem}>
                  <Linkedin size={11} />
                  <span dir="ltr">LinkedIn</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Summary */}
      {resume.summary && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>خلاصه حرفه‌ای</h2>
          <p className={styles.summaryText}>{resume.summary}</p>
        </section>
      )}

      {/* Personal Info */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>اطلاعات شخصی</h2>
        <div className={styles.infoGrid}>
          {resume.birth_date && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>تاریخ تولد:</span>
              <span>{formatDate(resume.birth_date)}</span>
            </div>
          )}
          {resume.gender_display && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>جنسیت:</span>
              <span>{resume.gender_display}</span>
            </div>
          )}
          {resume.marital_status_display && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>وضعیت تاهل:</span>
              <span>{resume.marital_status_display}</span>
            </div>
          )}
          {resume.military_status_display && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>خدمت سربازی:</span>
              <span>{resume.military_status_display}</span>
            </div>
          )}
          {resume.address && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>آدرس:</span>
              <span>{resume.address}</span>
            </div>
          )}
        </div>
      </section>

      {/* Work Experience */}
      {w.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>سوابق شغلی</h2>
          <div className={styles.list}>
            {w.map((exp) => (
              <div key={exp.id} className={styles.listItem}>
                <div className={styles.listHeader}>
                  <h3 className={styles.itemTitle}>{exp.job_title}</h3>
                  <span className={styles.itemDate}>
                    {formatDate(exp.start_date)} -{" "}
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
                  <ul className={styles.itemList}>
                    {exp.achievements.split("\n").filter(Boolean).map((ach, idx) => (
                      <li key={idx}>{ach}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {e.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>تحصیلات</h2>
          <div className={styles.list}>
            {e.map((edu) => (
              <div key={edu.id} className={styles.listItem}>
                <div className={styles.listHeader}>
                  <h3 className={styles.itemTitle}>
                    {edu.degree_display} {edu.field_of_study}
                  </h3>
                  <span className={styles.itemDate}>
                    {formatDate(edu.start_date)} -{" "}
                    {edu.is_current ? "در حال تحصیل" : formatDate(edu.end_date)}
                  </span>
                </div>
                <p className={styles.itemSubtitle}>
                  {edu.institution}
                  {edu.city_name && ` • ${edu.city_name}`}
                  {edu.gpa && ` • معدل: ${edu.gpa}`}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {s.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>مهارت‌ها</h2>
          <div className={styles.skillsGrid}>
            {s.map((skill) => (
              <div key={skill.id} className={styles.skillItem}>
                <div className={styles.skillHeader}>
                  <span className={styles.skillName}>{skill.name}</span>
                  <span className={styles.skillLevel}>{skill.level_display}</span>
                </div>
                {renderSkillBar(skill.level)}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {l.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>زبان‌ها</h2>
          <div className={styles.langsGrid}>
            {l.map((lang) => (
              <div key={lang.id} className={styles.langItem}>
                <strong>{lang.name}</strong>
                <span className={styles.langLevel}>{lang.level_display}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certificates */}
      {c.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>دوره‌ها و گواهی‌نامه‌ها</h2>
          <ul className={styles.simpleList}>
            {c.map((cert) => (
              <li key={cert.id}>
                <strong>{cert.title}</strong>
                {cert.institution && ` — ${cert.institution}`}
                {cert.issue_date && ` (${formatDate(cert.issue_date)})`}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Projects */}
      {p.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>پروژه‌ها</h2>
          <div className={styles.list}>
            {p.map((proj) => (
              <div key={proj.id} className={styles.listItem}>
                <div className={styles.listHeader}>
                  <h3 className={styles.itemTitle}>{proj.title}</h3>
                  {proj.role && (
                    <span className={styles.itemDate}>{proj.role}</span>
                  )}
                </div>
                {proj.description && (
                  <p className={styles.itemDesc}>{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Awards */}
      {a.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>افتخارات</h2>
          <ul className={styles.simpleList}>
            {a.map((award) => (
              <li key={award.id}>
                <strong>{award.title}</strong>
                {award.issuer && ` — ${award.issuer}`}
                {award.date && ` (${formatDate(award.date)})`}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Interests */}
      {i.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>علاقه‌مندی‌ها</h2>
          <div className={styles.interestsList}>
            {i.map((interest) => (
              <span key={interest.id} className={styles.interestTag}>
                {interest.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ClassicTemplate;