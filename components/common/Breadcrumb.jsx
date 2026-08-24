// components/common/Breadcrumb.jsx
import Link from 'next/link';

export default function Breadcrumb({ items }) {
  return (
    <nav className="text-sm mb-8" aria-label="مسیر راهنما">
      <ol className="flex items-center gap-2 text-gray-500 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const href = index === 0 ? '/' : `/${encodeURIComponent(item)}`;
          
          return (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              {isLast ? (
                <span className="text-primary font-semibold">{item}</span>
              ) : (
                <Link href={href} className="hover:text-primary transition-colors">
                  {item}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}