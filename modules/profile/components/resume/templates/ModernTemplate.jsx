// modules/profile/components/resume/templates/ModernTemplate.jsx
"use client";

import styles from "./ModernTemplate.module.css";
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

const ModernTemplate = ({ resume }) => {
  const w = resume.work_experiences || [];
  const e = resume.educations || [];
  const s = resume.skills || [];
  const l = resume.languages || [];
  const c = resume.certificates || [];
  const p = resume.projects || [];
  const a = resume.awards || [];
  const i = resume.interests || [];

  const renderSkillLevel = (level) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <span
        key={idx}
        className={`${styles.skillDot} ${idx < level ? styles.skillFilled : ""}`}
      />
    ));
  };

  return (
    <div className={styles.template} dir="rtl">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.name}>{resume.full_name}</h1>
          {resume.job_title && (
            <p className={styles.jobTitle}>{resume.job_title}</p>
          )}
          {resume.summary && (
            <p className={styles.summary}>{resume.summary}</p>
          )}
        </div>

        {resume.image_url && (
          <div className={styles.headerRight}>
            <img
              src={resume.image_url}
              alt={resume.full_name}
              className={styles.profileImage}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {/* اطلاعات تماس */}
          <section className={styles.sideSection}>
            <h3 className={styles.sideSectionTitle}>اطلاعات تماس</h3>
            <div className={styles.contactList}>
              {resume.mobile && (
                <div className={styles.contactItem}>
                  <Phone size={13} />
                  <span dir="ltr">{resume.mobile}</span>
                </div>
              )}
              {resume.phone && (
                <div className={styles.contactItem}>
                  <Phone size={13} />
                  <span dir="ltr">{resume.phone}</span>
                </div>
              )}
              {resume.email && (
                <div className={styles.contactItem}>
                  <Mail size={13} />
                  <span dir="ltr">{resume.email}</span>
                </div>
              )}
              {resume.address && (
                <div className={styles.contactItem}>
                  <MapPin size={13} />
                  <span>{resume.address}</span>
                </div>
              )}
              {resume.city_name && (
                <div className={styles.contactItem}>
                  <MapPin size={13} />
                  <span>{resume.city_name}</span>
                </div>
              )}
              {resume.website && (
                <div className={styles.contactItem}>
                  <Globe size={13} />
                  <span dir="ltr">{resume.website}</span>
                </div>
              )}
              {resume.linkedin && (
                <div className={styles.contactItem}>
                  <Linkedin size={13} />
                  <span dir="ltr">LinkedIn</span>
                </div>
              )}
              {resume.github && (
                <div className={styles.contactItem}>
                  <Github size={13} />
                  <span dir="ltr">GitHub</span>
                </div>
              )}
            </div>
          </section>

          {/* اطلاعات شخصی */}
          <section className={styles.sideSection}>
            <h3 className={styles.sideSectionTitle}>اطلاعات شخصی</h3>
            <div className={styles.contactList}>
              {resume.birth_date && (
                <div className={styles.contactItem}>
                  <Calendar size={13} />
                  <span>{formatDate(resume.birth_date)}</span>
                </div>
              )}
              {resume.gender_display && (
                <div className={styles.contactItem}>
                  <User size={13} />
                  <span>{resume.gender_display}</span>
                </div>
              )}
              {resume.marital_status_display && (
                <div className={styles.contactItem}>
                  <Heart size={13} />
                  <span>{resume.marital_status_display}</span>
                </div>
              )}
              {resume.military_status_display && (
                <div className={styles.contactItem}>
                  <Star size={13} />
                  <span>{resume.military_status_display}</span>
                </div>
              )}
            </div>
          </section>

          {/* مهارت‌ها */}
          {s.length > 0 && (
            <section className={styles.sideSection}>
              <h3 className={styles.sideSectionTitle}>مهارت‌ها</h3>
              <div className={styles.skillsList}>
                {s.map((skill) => (
                  <div key={skill.id} className={styles.skillItem}>
                    <div className={styles.skillHeader}>
                      <span className={styles.skillName}>{skill.name}</span>
                      <div className={styles.skillDots}>
                        {renderSkillLevel(skill.level)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* زبان‌ها */}
          {l.length > 0 && (
            <section className={styles.sideSection}>
              <h3 className={styles.sideSectionTitle}>زبان‌ها</h3>
              <div className={styles.langList}>
                {l.map((lang) => (
                  <div key={lang.id} className={styles.langItem}>
                    <span className={styles.langName}>{lang.name}</span>
                    <span className={styles.langLevel}>{lang.level_display}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* علاقه‌مندی‌ها */}
          {i.length > 0 && (
            <section className={styles.sideSection}>
              <h3 className={styles.sideSectionTitle}>علاقه‌مندی‌ها</h3>
              <div className={styles.interestsList}>
                {i.map((interest) => (
                  <span key={interest.id} className={styles.interestTag}>
                    {interest.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </aside>

        {/* Main */}
        <main className={styles.main}>
          {/* سوابق شغلی */}
          {w.length > 0 && (
            <section className={styles.mainSection}>
              <h2 className={styles.sectionTitle}>
                <Briefcase size={16} />
                سوابق شغلی
              </h2>
              <div className={styles.timeline}>
                {w.map((exp) => (
                  <div key={exp.id} className={styles.timelineItem}>
                    <div className={styles.timelineHeader}>
                      <h3 className={styles.timelineTitle}>{exp.job_title}</h3>
                      <span className={styles.timelineDate}>
                        {formatDate(exp.start_date)} -{" "}
                        {exp.is_current ? "تاکنون" : formatDate(exp.end_date)}
                      </span>
                    </div>
                    <p className={styles.timelineCompany}>
                      {exp.company_name}
                      {exp.city_name && ` • ${exp.city_name}`}
                    </p>
                    {exp.description && (
                      <p className={styles.timelineDesc}>{exp.description}</p>
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
              </div>
            </section>
          )}

          {/* تحصیلات */}
          {e.length > 0 && (
            <section className={styles.mainSection}>
              <h2 className={styles.sectionTitle}>
                <GraduationCap size={16} />
                تحصیلات
              </h2>
              <div className={styles.timeline}>
                {e.map((edu) => (
                  <div key={edu.id} className={styles.timelineItem}>
                    <div className={styles.timelineHeader}>
                      <h3 className={styles.timelineTitle}>
                        {edu.degree_display} {edu.field_of_study}
                      </h3>
                      <span className={styles.timelineDate}>
                        {formatDate(edu.start_date)} -{" "}
                        {edu.is_current ? "در حال تحصیل" : formatDate(edu.end_date)}
                      </span>
                    </div>
                    <p className={styles.timelineCompany}>
                      {edu.institution}
                      {edu.city_name && ` • ${edu.city_name}`}
                      {edu.gpa && ` • معدل: ${edu.gpa}`}
                    </p>
                    {edu.description && (
                      <p className={styles.timelineDesc}>{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* پروژه‌ها */}
          {p.length > 0 && (
            <section className={styles.mainSection}>
              <h2 className={styles.sectionTitle}>
                <Star size={16} />
                پروژه‌ها
              </h2>
              <div className={styles.projectsList}>
                {p.map((proj) => (
                  <div key={proj.id} className={styles.projectItem}>
                    <div className={styles.projectHeader}>
                      <h3 className={styles.projectTitle}>{proj.title}</h3>
                      {proj.role && (
                        <span className={styles.projectRole}>{proj.role}</span>
                      )}
                    </div>
                    {proj.description && (
                      <p className={styles.projectDesc}>{proj.description}</p>
                    )}
                    {proj.link && (
                      <a
                        href={proj.link}
                        className={styles.projectLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        dir="ltr"
                      >
                        {proj.link}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* دوره‌ها */}
          {c.length > 0 && (
            <section className={styles.mainSection}>
              <h2 className={styles.sectionTitle}>
                <Award size={16} />
                دوره‌ها و گواهی‌نامه‌ها
              </h2>
              <ul className={styles.certList}>
                {c.map((cert) => (
                  <li key={cert.id} className={styles.certItem}>
                    <div>
                      <strong>{cert.title}</strong>
                      {cert.institution && (
                        <span className={styles.certInst}> — {cert.institution}</span>
                      )}
                    </div>
                    {cert.issue_date && (
                      <span className={styles.certDate}>
                        {formatDate(cert.issue_date)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* افتخارات */}
          {a.length > 0 && (
            <section className={styles.mainSection}>
              <h2 className={styles.sectionTitle}>
                <Award size={16} />
                افتخارات
              </h2>
              <ul className={styles.certList}>
                {a.map((award) => (
                  <li key={award.id} className={styles.certItem}>
                    <div>
                      <strong>{award.title}</strong>
                      {award.issuer && (
                        <span className={styles.certInst}> — {award.issuer}</span>
                      )}
                    </div>
                    {award.date && (
                      <span className={styles.certDate}>
                        {formatDate(award.date)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default ModernTemplate;