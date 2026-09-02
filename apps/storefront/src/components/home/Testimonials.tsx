"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  CheckCircle,
  Heart,
  Quote,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Users,
  MessageSquarePlus,
  X,
  Share2,
  Package,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useLanguage } from "@/context/LanguageContext";
import { REVIEWS as INITIAL_REVIEWS } from "@/lib/catalog";
import { Review } from "@/types";
import styles from "./Testimonials.module.css";

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #10D876, #059E57)",
  "linear-gradient(135deg, #F59E0B, #D97706)",
  "linear-gradient(135deg, #6366F1, #4F46E5)",
  "linear-gradient(135deg, #EC4899, #BE185D)",
  "linear-gradient(135deg, #06B6D4, #0891B2)",
  "linear-gradient(135deg, #8B5CF6, #6D28D9)",
];

export function Testimonials() {
  const { formatPrice } = useLanguage();
  const [reviewsList, setReviewsList] = useState<Review[]>(INITIAL_REVIEWS);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [likedReviews, setLikedReviews] = useState<Record<string, number>>({});
  const [userHasLiked, setUserHasLiked] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newCategory, setNewCategory] = useState<"fish" | "veggies" | "village" | "express">("fish");
  const [newComment, setNewComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Filter reviews
  const filteredReviews = reviewsList.filter((rev) => {
    if (activeCategory === "all") return true;
    return rev.category === activeCategory;
  });

  const itemsPerPage = 3;
  const maxPages = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage));

  // Autoplay
  useEffect(() => {
    if (isPaused || maxPages <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % maxPages);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, maxPages]);

  // Reset page index when category changes
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentIndex(0);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2);

  const handleLike = (id: string, initialLikes: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = userHasLiked[id];
    const currentCount = likedReviews[id] ?? initialLikes;

    if (!isLiked) {
      setLikedReviews((prev) => ({ ...prev, [id]: currentCount + 1 }));
      setUserHasLiked((prev) => ({ ...prev, [id]: true }));
      try {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight,
          },
          colors: ["#FF4D6D", "#10D876", "#F5C842"],
        });
      } catch {}
    } else {
      setLikedReviews((prev) => ({ ...prev, [id]: Math.max(0, currentCount - 1) }));
      setUserHasLiked((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleShare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      userName: newName.trim(),
      userLocation: newLocation.trim() || "Dhaka, Bangladesh",
      rating: newRating,
      date: "Today",
      commentBn: newComment.trim(),
      commentEn: newComment.trim(),
      verifiedPurchase: true,
      likes: 1,
      category: newCategory,
      productNameBn: "Fresh Verified Grocery Item",
      productNameEn: "Fresh Verified Grocery Item",
      userRoleBn: "Verified Buyer",
      userRoleEn: "Verified Buyer",
      deliveryTimeBn: "Delivered in 30 mins",
      deliveryTimeEn: "Delivered in 30 mins",
    };

    setReviewsList([newRev, ...reviewsList]);
    setIsSubmitted(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10D876", "#F5C842", "#34D399", "#60A5FA"],
      });
    } catch {}

    setTimeout(() => {
      setIsSubmitted(false);
      setIsModalOpen(false);
      setNewName("");
      setNewLocation("");
      setNewComment("");
      setNewRating(5);
    }, 1400);
  };

  const categories = [
    { id: "all", labelBn: "✨ All Stories", labelEn: "✨ All Stories", count: reviewsList.length },
    {
      id: "fish",
      labelBn: "🐟 Fresh Fish & Meat",
      labelEn: "🐟 Fresh Fish & Meat",
      count: reviewsList.filter((r) => r.category === "fish").length,
    },
    {
      id: "veggies",
      labelBn: "🥦 Organic Veggies",
      labelEn: "🥦 Organic Veggies",
      count: reviewsList.filter((r) => r.category === "veggies").length,
    },
    {
      id: "village",
      labelBn: "🍯 Pure Village Goods",
      labelEn: "🍯 Pure Village Goods",
      count: reviewsList.filter((r) => r.category === "village").length,
    },
    {
      id: "express",
      labelBn: "⚡ Fast Delivery",
      labelEn: "⚡ Fast Delivery",
      count: reviewsList.filter((r) => r.category === "express").length,
    },
  ];

  const visibleReviews = filteredReviews.slice(
    currentIndex * itemsPerPage,
    currentIndex * itemsPerPage + itemsPerPage
  );

  return (
    <section className={styles.testimonialsSection}>
      {/* Dynamic Aurora Ambient Lighting */}
      <div className={styles.auroraGlow1} />
      <div className={styles.auroraGlow2} />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Section Header */}
        <div className={styles.headerWrapper}>
          <div className={styles.badgePill}>
            <span className={styles.pulseDot} />
            <Sparkles size={13} color="#F5C842" />
            <span>100% Fresh & Authentic • 12,450+ Happy Families</span>
          </div>

          <h2 className={styles.mainTitle}>
            Cherished Stories from <span className={styles.gradientAccent}>Our Real Customers</span>
          </h2>

          <p className={styles.subTitle}>
            Direct from the rivers and organic farms to your dining table with prompt, temperature-controlled delivery.
          </p>

          {/* Trust Ribbon Bar */}
          <div className={styles.trustRibbon}>
            <div className={styles.trustRibbonItem}>
              <div style={{ display: "flex", gap: "2px" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} fill="#F5C842" color="#F5C842" />
                ))}
              </div>
              <span>4.9/5 (12.4K+ Reviews)</span>
            </div>

            <div className={styles.trustRibbonDivider} />

            <div className={styles.trustRibbonItem}>
              <Zap size={14} color="#60A5FA" />
              <span>99.4% On-Time Delivery</span>
            </div>

            <div className={styles.trustRibbonDivider} />

            <div className={styles.trustRibbonItem}>
              <ShieldCheck size={14} color="#34D399" />
              <span>100% Money-Back Guarantee</span>
            </div>

            <button
              className={styles.writeReviewBtn}
              onClick={() => setIsModalOpen(true)}
              title="Share your review"
            >
              <MessageSquarePlus size={14} />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className={styles.filterBar}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`${styles.filterTab} ${
                activeCategory === cat.id ? styles.filterTabActive : ""
              }`}
            >
              <span>{cat.labelEn}</span>
              <span className={styles.filterCount}>{cat.count}</span>
            </button>
          ))}
        </div>

        {/* Reviews Cards Slider / Grid */}
        <div
          className={styles.sliderWrapper}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className={styles.cardsGrid}>
            {visibleReviews.map((rev, idx) => {
              const currentLikes = likedReviews[rev.id] ?? rev.likes;
              const isLiked = !!userHasLiked[rev.id];

              return (
                <div
                  key={rev.id}
                  className={`${styles.reviewCard} ${idx === 0 ? styles.activeCard : ""}`}
                >
                  <div className={styles.cardTopAccentLine} />

                  {/* Decorative Quote Mark */}
                  <div className={styles.cardQuoteWatermark}>
                    <Quote size={56} />
                  </div>

                  {/* Card Header: Author Info */}
                  <div className={styles.cardHeader}>
                    <div className={styles.authorBlock}>
                      <div
                        className={styles.avatarRing}
                        style={{
                          background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length],
                        }}
                      >
                        {getInitials(rev.userName)}
                        <span className={styles.avatarOnlineDot} />
                      </div>
                      <div className={styles.authorInfo}>
                        <div className={styles.authorNameRow}>
                          <span className={styles.authorName}>{rev.userName}</span>
                          {rev.userRoleEn && (
                            <span className={styles.authorRolePill}>
                              {rev.userRoleEn}
                            </span>
                          )}
                        </div>
                        <span className={styles.authorLocation}>
                          <MapPin size={11} color="var(--text-muted)" />
                          {rev.userLocation}
                        </span>
                      </div>
                    </div>

                    {rev.verifiedPurchase && (
                      <span className={styles.verifiedBadge}>
                        <CheckCircle size={12} />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  {/* Purchased Product Tag */}
                  {rev.productNameEn && (
                    <div className={styles.productTag}>
                      <Package size={13} color="#10D876" />
                      <span>
                        Ordered: <strong>{rev.productNameEn}</strong>
                      </span>
                    </div>
                  )}

                  {/* Star Rating & Delivery turnaround */}
                  <div className={styles.ratingTimeRow}>
                    <div className={styles.starsContainer}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={15}
                          className={i < rev.rating ? styles.starGleam : ""}
                          fill={i < rev.rating ? "#F5C842" : "none"}
                          color={i < rev.rating ? "#F5C842" : "rgba(255,255,255,0.15)"}
                        />
                      ))}
                    </div>

                    {rev.deliveryTimeEn && (
                      <span className={styles.deliveryTurnaroundPill}>
                        <Zap size={11} />
                        {rev.deliveryTimeEn}
                      </span>
                    )}
                  </div>

                  {/* Comment Body */}
                  <p className={styles.commentBody}>
                    &ldquo;{rev.commentEn}&rdquo;
                  </p>

                  {/* Card Footer */}
                  <div className={styles.cardFooter}>
                    <span className={styles.reviewDate}>{rev.date}</span>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        className={`${styles.helpfulBtn} ${isLiked ? styles.helpfulBtnActive : ""}`}
                        onClick={(e) => handleLike(rev.id, rev.likes, e)}
                        title="Helpful"
                      >
                        <Heart
                          size={13}
                          fill={isLiked ? "#FF4D6D" : "none"}
                          color={isLiked ? "#FF4D6D" : "currentColor"}
                        />
                        <span>{currentLikes}</span>
                      </button>

                      <button
                        className={styles.helpfulBtn}
                        onClick={(e) => handleShare(rev.id, e)}
                        title={copiedId === rev.id ? "Copied!" : "Share"}
                      >
                        <Share2 size={12} />
                        <span>{copiedId === rev.id ? "Copied" : "Share"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slider Controls */}
          {maxPages > 1 && (
            <div className={styles.sliderControls}>
              <button
                className={styles.navArrowBtn}
                onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxPages - 1))}
                aria-label="Previous reviews"
              >
                <ChevronLeft size={18} />
              </button>

              <div className={styles.dotsRow}>
                {Array.from({ length: maxPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`${styles.dotBtn} ${
                      currentIndex === idx ? styles.dotBtnActive : ""
                    }`}
                    style={{
                      width: currentIndex === idx ? "28px" : "8px",
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                className={styles.navArrowBtn}
                onClick={() => setCurrentIndex((prev) => (prev + 1) % maxPages)}
                aria-label="Next reviews"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Bento Trust Statistics Grid (Bottom) */}
        <div className={styles.statsBentoGrid}>
          {/* Card 1 */}
          <div className={styles.statsCard}>
            <div
              className={styles.statsIconBox}
              style={{
                background: "rgba(16, 216, 118, 0.12)",
                color: "#10D876",
                border: "1px solid rgba(16, 216, 118, 0.25)",
              }}
            >
              <Users size={22} />
            </div>
            <div>
              <div
                className={styles.statsNumber}
                style={{
                  background: "linear-gradient(135deg, #10D876, #6EE7B7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                15,000+
              </div>
              <div className={styles.statsTitle}>
                Happy Families
              </div>
              <div className={styles.statsDesc}>
                Daily recurring trusted households across BD
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className={styles.statsCard}>
            <div
              className={styles.statsIconBox}
              style={{
                background: "rgba(245, 200, 66, 0.12)",
                color: "#F5C842",
                border: "1px solid rgba(245, 200, 66, 0.25)",
              }}
            >
              <Star size={22} fill="#F5C842" />
            </div>
            <div>
              <div
                className={styles.statsNumber}
                style={{
                  background: "linear-gradient(135deg, #F5C842, #FCD34D)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                4.9 / 5.0
              </div>
              <div className={styles.statsTitle}>
                Average Rating
              </div>
              <div className={styles.statsDesc}>
                Based on 12,450+ verified customer reviews
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className={styles.statsCard}>
            <div
              className={styles.statsIconBox}
              style={{
                background: "rgba(96, 165, 250, 0.12)",
                color: "#60A5FA",
                border: "1px solid rgba(96, 165, 250, 0.25)",
              }}
            >
              <Zap size={22} />
            </div>
            <div>
              <div
                className={styles.statsNumber}
                style={{
                  background: "linear-gradient(135deg, #60A5FA, #93C5FD)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                99.4%
              </div>
              <div className={styles.statsTitle}>
                On-Time Delivery
              </div>
              <div className={styles.statsDesc}>
                Average doorstep delivery in 30-45 mins
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className={styles.statsCard}>
            <div
              className={styles.statsIconBox}
              style={{
                background: "rgba(236, 72, 153, 0.12)",
                color: "#EC4899",
                border: "1px solid rgba(236, 72, 153, 0.25)",
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <div
                className={styles.statsNumber}
                style={{
                  background: "linear-gradient(135deg, #EC4899, #F472B6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                100%
              </div>
              <div className={styles.statsTitle}>
                Fresh Guarantee
              </div>
              <div className={styles.statsDesc}>
                Instant hassle-free replacement or refund
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalCloseBtn}
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Share Your Experience
              </h3>
              <p className={styles.modalSub}>
                Your honest feedback helps thousands of families and helps us improve.
              </p>
            </div>

            {isSubmitted ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "rgba(16, 216, 118, 0.15)",
                    color: "#10D876",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    border: "2px solid #10D876",
                  }}
                >
                  <CheckCircle size={32} />
                </div>
                <h4 style={{ color: "var(--text-main)", fontSize: "1.2rem", margin: "0 0 6px" }}>
                  Thank You! Review Added
                </h4>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
                  Your review has been successfully published.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                {/* Rating picker */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Select Rating
                  </label>
                  <div className={styles.ratingPicker}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={styles.starPickerBtn}
                        onClick={() => setNewRating(star)}
                      >
                        <Star
                          size={28}
                          fill={star <= newRating ? "#F5C842" : "none"}
                          color={star <= newRating ? "#F5C842" : "rgba(255,255,255,0.2)"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Location */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginBottom: "14px",
                  }}
                >
                  <div>
                    <label className={styles.formLabel}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tanvir Hasan"
                      className={styles.formInput}
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={styles.formLabel}>
                      Area & City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dhanmondi, Dhaka"
                      className={styles.formInput}
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                    />
                  </div>
                </div>

                {/* Category select */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Product Category
                  </label>
                  <select
                    className={styles.formSelect}
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as "fish" | "veggies" | "village" | "express")
                    }
                  >
                    <option value="fish">🐟 Fresh Fish & Meat</option>
                    <option value="veggies">🥦 Organic Veggies</option>
                    <option value="village">🍯 Pure Village Goods</option>
                    <option value="express">⚡ Express Delivery</option>
                  </select>
                </div>

                {/* Comment Textarea */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Your Feedback *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Write about product freshness, packaging, delivery experience..."
                    className={styles.formTextarea}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                </div>

                <button type="submit" className={styles.submitModalBtn}>
                  Submit Review ✨
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
