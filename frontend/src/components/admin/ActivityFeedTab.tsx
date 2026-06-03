'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getActivityFeedAction, type ActivityFeedItem } from '@/app/admin/actions/activity.actions';

/* ── Design Tokens ── */
const T = {
  card: '#ffffff',
  bdr: '#e2e8f0',
  ind: '#d97706',
  em: '#16a34a',
  tx: '#1e293b',
  mu: '#64748b',
  mu2: '#475569',
  warn: '#f59e0b',
  err: '#ef4444',
  info: '#3b82f6',
};

/* ── Activity Type to Icon + Color mapping ── */
const ACTIVITY_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  'order.created':     { icon: '🛒', color: T.em,   bg: 'rgba(16,185,129,0.12)' },
  'order.updated':     { icon: '📝', color: T.info,  bg: 'rgba(59,130,246,0.12)' },
  'order.cancelled':   { icon: '❌', color: T.err,   bg: 'rgba(239,68,68,0.12)' },
  'order.completed':   { icon: '✅', color: T.em,   bg: 'rgba(16,185,129,0.12)' },
  'bill.generated':    { icon: '🧾', color: T.ind,  bg: 'rgba(226,135,67,0.12)' },
  'bill.paid':         { icon: '💰', color: T.em,   bg: 'rgba(16,185,129,0.12)' },
  'menu.updated':      { icon: '🍽',  color: T.info,  bg: 'rgba(59,130,246,0.12)' },
  'menu.item_added':   { icon: '➕', color: T.em,   bg: 'rgba(16,185,129,0.12)' },
  'menu.item_removed': { icon: '➖', color: T.err,   bg: 'rgba(239,68,68,0.12)' },
  'staff.clock_in':    { icon: '🟢', color: T.em,   bg: 'rgba(16,185,129,0.12)' },
  'staff.clock_out':   { icon: '🔴', color: T.err,   bg: 'rgba(239,68,68,0.12)' },
  'table.opened':      { icon: '🪑', color: T.info,  bg: 'rgba(59,130,246,0.12)' },
  'table.closed':      { icon: '🔒', color: T.mu,   bg: 'rgba(140,150,163,0.12)' },
  'storefront.publish':{ icon: '🚀', color: T.ind,  bg: 'rgba(226,135,67,0.12)' },
  'customer.created':  { icon: '👤', color: T.info,  bg: 'rgba(59,130,246,0.12)' },
  'offer.redeemed':    { icon: '🎫', color: T.warn, bg: 'rgba(245,158,11,0.12)' },
  'announcement':      { icon: '📢', color: T.warn, bg: 'rgba(245,158,11,0.12)' },
};

const DEFAULT_ICON = { icon: '📌', color: T.mu, bg: 'rgba(140,150,163,0.08)' };

function getActivityMeta(type: string) {
  return ACTIVITY_ICONS[type] ?? DEFAULT_ICON;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function groupByDate(items: ActivityFeedItem[]): Record<string, ActivityFeedItem[]> {
  const groups: Record<string, ActivityFeedItem[]> = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (const item of items) {
    const d = new Date(item.created_at).toDateString();
    let label: string;
    if (d === today) label = 'Today';
    else if (d === yesterday) label = 'Yesterday';
    else label = new Date(item.created_at).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }
  return groups;
}

/* ── Filter Chips ── */
const FILTER_OPTIONS = [
  { key: 'all', label: 'All Activity' },
  { key: 'order', label: 'Orders' },
  { key: 'bill', label: 'Billing' },
  { key: 'menu', label: 'Menu' },
  { key: 'staff', label: 'Staff' },
  { key: 'table', label: 'Tables' },
  { key: 'storefront', label: 'Storefront' },
  { key: 'customer', label: 'Customers' },
];

export default function ActivityFeedTab() {
  const [items, setItems] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchFeed = useCallback(async (cursor?: string) => {
    try {
      const data = await getActivityFeedAction(50, cursor);
      if (cursor) {
        setItems(prev => [...prev, ...data]);
      } else {
        setItems(data);
      }
      setHasMore(data.length === 50);
    } catch (err) {
      console.error('Failed to load activity feed:', err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchFeed().finally(() => setLoading(false));
  }, [fetchFeed]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFeed();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchFeed]);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const lastItem = items[items.length - 1];
    if (lastItem) {
      await fetchFeed(lastItem.created_at);
    }
    setLoadingMore(false);
  };

  // Filter + Search
  const filteredItems = items.filter(item => {
    if (filter !== 'all' && !item.activity_type.startsWith(filter)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchText = (item.display_text ?? '').toLowerCase().includes(q);
      const matchStaff = (item.staff_name ?? '').toLowerCase().includes(q);
      const matchType = item.activity_type.toLowerCase().includes(q);
      return matchText || matchStaff || matchType;
    }
    return true;
  });

  const grouped = groupByDate(filteredItems);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: T.tx,
          margin: 0
        }}>
          Activity Feed
        </h1>
        <p style={{ fontSize: '13px', color: T.mu, marginTop: '6px', fontWeight: 500 }}>
          Real-time stream of all staff actions, orders, and system events across your restaurant.
        </p>
      </div>

      {/* Search + Filter Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {/* Search Input */}
        <div style={{
          position: 'relative',
          flex: '1 1 220px',
          minWidth: '180px'
        }}>
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '14px',
            opacity: 0.5
          }}>🔍</span>
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 36px',
              background: T.card,
              border: `1px solid ${T.bdr}`,
              borderRadius: '12px',
              color: T.tx,
              fontSize: '13px',
              fontWeight: 500,
              outline: 'none',
            }}
          />
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => { setLoading(true); fetchFeed().finally(() => setLoading(false)); }}
          style={{
            padding: '10px 16px',
            background: T.card,
            border: `1px solid ${T.bdr}`,
            borderRadius: '12px',
            color: T.mu,
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s'
          }}
          onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.color = T.ind; }}
          onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.color = T.mu; }}
        >
          <span style={{ fontSize: '14px' }}>🔄</span>
          Refresh
        </button>
      </div>

      {/* Filter Chips */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {FILTER_OPTIONS.map(opt => {
          const isActive = filter === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              style={{
                padding: '7px 16px',
                borderRadius: '20px',
                border: `1px solid ${isActive ? T.ind : T.bdr}`,
                background: isActive ? `rgba(226,135,67,0.15)` : 'transparent',
                color: isActive ? T.ind : T.mu,
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.03em',
                cursor: 'pointer',
                transition: 'all 0.15s',
                textTransform: 'uppercase'
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Feed Content */}
      <div
        ref={scrollRef}
        style={{
          maxHeight: 'calc(100vh - 320px)',
          overflowY: 'auto',
          paddingRight: '4px'
        }}
      >
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 0',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: `3px solid ${T.bdr}`,
              borderTopColor: T.ind,
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <span style={{ fontSize: '12px', color: T.mu, fontWeight: 600 }}>Loading activity...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: T.mu
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📡</div>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px', color: T.tx }}>
              {searchQuery || filter !== 'all' ? 'No matching activities' : 'No activity yet'}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 500 }}>
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Activity will appear here as staff take actions in the restaurant.'}
            </div>
          </div>
        ) : (
          Object.entries(grouped).map(([dateLabel, dateItems]) => (
            <div key={dateLabel} style={{ marginBottom: '28px' }}>
              {/* Date Group Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '14px'
              }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: T.mu,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap'
                }}>
                  {dateLabel}
                </span>
                <div style={{
                  flex: 1,
                  height: '1px',
                  background: `linear-gradient(90deg, ${T.bdr}, transparent)`
                }} />
              </div>

              {/* Activity Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {dateItems.map((item, idx) => {
                  const meta = getActivityMeta(item.activity_type);
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        transition: 'background 0.12s',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                      }}
                    >
                      {/* Timeline Dot */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, flexShrink: 0 }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: meta.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px'
                        }}>
                          {meta.icon}
                        </div>
                        {idx < dateItems.length - 1 && (
                          <div style={{
                            width: '2px',
                            height: '24px',
                            background: `linear-gradient(180deg, ${T.bdr}, transparent)`,
                            marginTop: '4px'
                          }} />
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: T.tx,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.display_text || formatActivityType(item.activity_type)}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {/* Staff Name Badge */}
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: meta.color,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: meta.bg
                          }}>
                            {item.staff_name || 'System'}
                          </span>

                          {/* Branch Badge */}
                          {item.branch_name && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              color: T.mu2,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: 'rgba(140,150,163,0.08)',
                              border: `1px solid ${T.bdr}`
                            }}>
                              📍 {item.branch_name}
                            </span>
                          )}

                          {/* Entity reference */}
                          {item.entity_type && item.entity_id && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              color: T.mu2
                            }}>
                              {item.entity_type}:{item.entity_id.substring(0, 8)}
                            </span>
                          )}

                          {/* Timestamp */}
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 500,
                            color: T.mu2,
                            marginLeft: 'auto',
                            whiteSpace: 'nowrap'
                          }}>
                            {relativeTime(item.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Load More */}
        {hasMore && filteredItems.length > 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <button
              onClick={loadMore}
              disabled={loadingMore}
              style={{
                padding: '10px 28px',
                borderRadius: '10px',
                border: `1px solid ${T.bdr}`,
                background: T.card,
                color: loadingMore ? T.mu2 : T.ind,
                fontSize: '12px',
                fontWeight: 700,
                cursor: loadingMore ? 'wait' : 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {loadingMore ? 'Loading...' : 'Load Older Activity'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Formats an activity_type string into a human-readable label. */
function formatActivityType(type: string): string {
  return type
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
