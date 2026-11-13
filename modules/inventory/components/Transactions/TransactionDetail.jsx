// modules/inventory/components/transactions/TransactionDetail.jsx

'use client';

import React, { useState, useEffect } from 'react';
import {
  Package, Building2, Hash, Calendar, Users,
  CheckCircle, X, Clock, FileText,
  Layers, GitBranch, ChevronDown,
  Ruler, Box, ArrowDownToLine, ArrowUpFromLine,
} from 'lucide-react';
import styles from './transaction.module.css';
import { buildTransactionEquivalents } from '../../utils/unitStock';

const faNum = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return '۰';
  if (Number.isInteger(num)) return num.toLocaleString('fa-IR');
  return num.toLocaleString('fa-IR', { maximumFractionDigits: 4 });
};

const TransactionDetail = ({
  transaction,
  onConfirm,
  onCancel,
  onClose,
  getTypeBadge,
  getStatusBadge,
  getProductName,
  getWarehouseName,
  getUnitName,
  getUnitAbbreviation,
  formatDate,
  t = {},
  state = {},
}) => {
  const [unitBreakdown, setUnitBreakdown] = useState([]);
  const [rootUnit, setRootUnit] = useState(null);

  useEffect(() => {
    if (!transaction) return;

    const product = state.products?.find((p) => p.id === transaction.product);
    if (!product) {
      setUnitBreakdown([]);
      setRootUnit(null);
      return;
    }

    const root = state.units?.find((u) => u.id === product.root_unit);
    setRootUnit(root || null);

    const selectedUnit = state.units?.find((u) => u.id === transaction.unit);
    if (!root || !selectedUnit) {
      setUnitBreakdown([]);
      return;
    }

    const qty = parseInt(transaction.quantity, 10) || 0;
    const equivalents = buildTransactionEquivalents({
      selectedUnit,
      quantity: qty,
      rootUnit: root,
      unitsList: state.units || [],
    });

    setUnitBreakdown(
      equivalents.map((item, index) => ({
        ...item,
        levelLabel:
          item.isRoot
            ? 'ریشه'
            : item.isSelected
              ? 'انتخاب‌شده'
              : `سطح ${index}`,
      }))
    );
  }, [transaction, state.products, state.units]);

  if (!transaction) return null;

  const isIn = transaction.transaction_type === 'IN';
  const isPending = transaction.status === 'PENDING';
  const isConfirmed = transaction.status === 'CONFIRMED';
  const isCancelled = transaction.status === 'CANCELLED';

  const openedRoot =
    transaction.root_quantity ??
    transaction.transaction_breakdown?.opened_root_packs ??
    transaction.transaction_breakdown?.root_quantity ??
    null;
  const takenFromBuffer =
    transaction.transaction_breakdown?.taken_from_buffer ?? 0;
  const returnedToBuffer =
    transaction.transaction_breakdown?.returned_to_buffer ?? 0;

  const selectedEquiv = unitBreakdown.find((b) => b.isSelected);
  const finestEquiv = unitBreakdown[unitBreakdown.length - 1];

  return (
    <div className={styles.transactionDetail}>
      <div className={styles.detailHeader}>
        <div className={styles.detailIcon}>
          {isIn ? (
            <ArrowDownToLine size={32} className={styles.iconIn} />
          ) : (
            <ArrowUpFromLine size={32} className={styles.iconOut} />
          )}
        </div>
        <div className={styles.detailTitleSection}>
          <h3 className={styles.detailTitle}>
            {isIn ? 'ورود کالا' : 'خروج کالا'}
          </h3>
          <div className={styles.detailBadges}>
            {getTypeBadge(transaction.transaction_type)}
            {getStatusBadge(transaction.status)}
          </div>
          <div className={styles.detailRef}>
            <Hash size={14} />
            <span>{transaction.reference_number}</span>
          </div>
        </div>
        <div className={styles.detailActions}>
          {isPending && (
            <>
              <button className={`${styles.primaryBtn} ${styles.confirmBtn}`} onClick={onConfirm}>
                <CheckCircle size={16} />
                {t.confirm || 'تایید'}
              </button>
              <button className={`${styles.secondaryBtn} ${styles.cancelBtn}`} onClick={onCancel}>
                <X size={16} />
                {t.cancel || 'لغو'}
              </button>
            </>
          )}
          <button className={styles.secondaryBtn} onClick={onClose}>
            <X size={16} />
            {t.close || 'بستن'}
          </button>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <Package size={14} /> کالا:
          </span>
          <span className={styles.detailValue}>
            {getProductName(transaction.product)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <Building2 size={14} /> انبار:
          </span>
          <span className={styles.detailValue}>
            {getWarehouseName(transaction.warehouse)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <Ruler size={14} /> واحد انتخاب شده:
          </span>
          <span className={styles.detailValue}>
            {getUnitName(transaction.unit)}
            {getUnitAbbreviation(transaction.unit) && (
              <span className={styles.detailSub}>({getUnitAbbreviation(transaction.unit)})</span>
            )}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <Box size={14} /> تعداد در واحد انتخاب شده:
          </span>
          <span className={styles.detailValue}>
            <span className={styles.detailNumber}>{faNum(transaction.quantity)}</span>
            <span className={styles.detailSub}>
              {getUnitAbbreviation(transaction.unit) || getUnitName(transaction.unit)}
            </span>
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <Layers size={14} />
            {isIn ? ' اضافه به واحد ریشه:' : ' از ریشه باز/کم شد:'}
          </span>
          <span className={styles.detailValue}>
            <span className={styles.detailNumber}>{faNum(openedRoot ?? 0)}</span>
            <span className={styles.detailSub}>
              {rootUnit?.abbreviation || rootUnit?.title || ''}
            </span>
            {!isIn && Number(openedRoot || 0) === 0 && Number(takenFromBuffer || 0) > 0 ? (
              <span className={styles.detailSub}> (از باقیمانده تبدیل‌نشده)</span>
            ) : null}
          </span>
        </div>
        {!isIn && Number(returnedToBuffer || 0) > 0 ? (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              <Layers size={14} /> باقیمانده برگشتی:
            </span>
            <span className={styles.detailValue}>
              <span className={styles.detailNumber}>{faNum(returnedToBuffer)}</span>
              <span className={styles.detailSub}>
                {getUnitAbbreviation(transaction.unit) || getUnitName(transaction.unit)}
              </span>
            </span>
          </div>
        ) : null}
        {finestEquiv && !finestEquiv.isSelected ? (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              <Box size={14} /> معادل ریزترین واحد:
            </span>
            <span className={styles.detailValue}>
              <span className={styles.detailNumber}>{faNum(finestEquiv.quantity)}</span>
              <span className={styles.detailSub}>
                {finestEquiv.unitAbbr || finestEquiv.unitName}
              </span>
            </span>
          </div>
        ) : null}
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <Calendar size={14} /> تاریخ ایجاد:
          </span>
          <span className={styles.detailValue}>
            {formatDate(transaction.created_at)}
          </span>
        </div>
        {transaction.confirmed_at && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              <CheckCircle size={14} /> تاریخ تایید:
            </span>
            <span className={styles.detailValue}>
              {formatDate(transaction.confirmed_at)}
            </span>
          </div>
        )}
        {transaction.created_by_name && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              <Users size={14} /> ایجاد کننده:
            </span>
            <span className={styles.detailValue}>
              {transaction.created_by_name}
            </span>
          </div>
        )}
        {transaction.authorized_by_name && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              <Users size={14} /> فرد مجاز:
            </span>
            <span className={styles.detailValue}>
              {transaction.authorized_by_name}
            </span>
          </div>
        )}
        {transaction.description && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              <FileText size={14} /> توضیحات:
            </span>
            <span className={styles.detailValue}>
              {transaction.description}
            </span>
          </div>
        )}
      </div>

      {unitBreakdown.length > 0 && (
        <div className={styles.breakdownSection}>
          <div className={styles.breakdownHeader}>
            <GitBranch size={18} />
            <h4>{t.breakdownTitle || 'معادل در واحدهای مختلف'}</h4>
            <span className={styles.breakdownBadge}>
              {unitBreakdown.length} سطح
            </span>
          </div>

          <div className={styles.breakdownGrid}>
            {unitBreakdown.map((item, index) => (
              <div
                key={item.unit.id}
                className={`${styles.breakdownItem}
                  ${item.isRoot ? styles.breakdownRoot : ''}
                  ${item.isSelected ? styles.breakdownSelected : ''}
                  ${isIn ? styles.breakdownIn : styles.breakdownOut}`}
              >
                <div className={styles.breakdownLevel}>
                  <span className={styles.breakdownLevelLabel}>
                    {item.levelLabel || `سطح ${item.level}`}
                  </span>
                  {index > 0 && item.countInParent ? (
                    <span className={styles.breakdownRatio}>
                      هر ۱ {unitBreakdown[index - 1]?.unitName} = {faNum(item.countInParent)} {item.unitName}
                    </span>
                  ) : null}
                </div>

                <div className={styles.breakdownUnit}>
                  <span className={styles.breakdownUnitName}>{item.unitName}</span>
                  {item.unitAbbr ? (
                    <span className={styles.breakdownUnitAbbr}>({item.unitAbbr})</span>
                  ) : null}
                </div>

                <div className={styles.breakdownQuantity}>
                  <span className={styles.breakdownQtyValue}>
                    {faNum(item.quantity)}
                  </span>
                  <span className={styles.breakdownQtyUnit}>
                    {item.unitAbbr || item.unitName}
                  </span>
                </div>

                {index < unitBreakdown.length - 1 ? (
                  <div className={styles.breakdownConversion}>
                    <ChevronDown size={12} />
                    <span>× {faNum(unitBreakdown[index + 1]?.countInParent || 1)}</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className={styles.breakdownTotal}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>
                {isIn ? 'ثبت در واحد انتخاب‌شده:' : 'خروج ثبت‌شده:'}
              </span>
              <span className={styles.totalValue}>
                {faNum(selectedEquiv?.quantity ?? transaction.quantity)}
                <span className={styles.totalUnit}>
                  {selectedEquiv?.unitAbbr ||
                    getUnitAbbreviation(transaction.unit) ||
                    getUnitName(transaction.unit)}
                </span>
              </span>
            </div>
            {finestEquiv && !finestEquiv.isSelected ? (
              <div
                className={styles.totalRow}
                style={{ marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}
              >
                <span>معادل ریزترین:</span>
                <span>
                  {faNum(finestEquiv.quantity)}{' '}
                  {finestEquiv.unitAbbr || finestEquiv.unitName}
                </span>
              </div>
            ) : null}
            {!isIn ? (
              <div
                className={styles.totalRow}
                style={{ marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}
              >
                <span>اثر روی ریشه:</span>
                <span>
                  باز شدن {faNum(openedRoot ?? 0)}{' '}
                  {rootUnit?.abbreviation || rootUnit?.title || ''}
                  {Number(takenFromBuffer || 0) > 0
                    ? ` · ${faNum(takenFromBuffer)} از باقیمانده`
                    : ''}
                  {Number(returnedToBuffer || 0) > 0
                    ? ` · برگشت ${faNum(returnedToBuffer)} به باقیمانده`
                    : ''}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <div className={styles.statusSection}>
        <div className={`${styles.statusInfo} ${isPending ? styles.statusPendingInfo : ''} ${isConfirmed ? styles.statusConfirmedInfo : ''} ${isCancelled ? styles.statusCancelledInfo : ''}`}>
          {isPending && (
            <>
              <Clock size={18} />
              <span>این تراکنش در انتظار تایید است</span>
            </>
          )}
          {isConfirmed && (
            <>
              <CheckCircle size={18} />
              <span>این تراکنش تایید شده است</span>
            </>
          )}
          {isCancelled && (
            <>
              <X size={18} />
              <span>این تراکنش لغو شده است</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
