
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Star,
  Store,
  Send,
  Mail,
  Image as ImageIcon,
} from "lucide-react";

import api from "../services/api";
import "./store-details.css";

export default function StoreDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [existingRating, setExistingRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadStore = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError("");

      const [storeResponse, ratingsResponse] = await Promise.all([
        api.get(`/stores/${id}`),
        api.get("/ratings/my-ratings"),
      ]);

      const currentStore = storeResponse.data.store;
      setStore(currentStore);

      const myRating = (ratingsResponse.data.ratings || []).find(
        (item) => item.storeId === id
      );

      if (myRating) {
        setExistingRating(myRating.value);
        setRating(myRating.value);
      } else {
        setExistingRating(0);
        setRating(0);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load store details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadStore();
  }, [loadStore]);

  const submitRating = async () => {
    if (!rating || rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5 stars.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const response = await api.post("/ratings", {
        storeId: id,
        value: rating,
      });

      if (response.data.success) {
        setExistingRating(rating);
        setMessage("Your rating has been saved successfully!");

        await loadStore(false);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to submit rating. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-loading">
        Loading store details...
      </div>
    );
  }

  if (error && !store) {
    return (
      <div className="detail-loading">
        <p>{error}</p>
        <button onClick={() => navigate("/dashboard")}>
          Back to Stores
        </button>
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="store-detail-page">
      <div className="detail-container">

        <button
          className="detail-back"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Back to Stores
        </button>

        {/* Store image */}
        <section className="detail-hero">

          <div
            style={{
              width: "100%",
              height: "300px",
              overflow: "hidden",
              borderRadius: "16px",
              marginBottom: "25px",
              background: "#171627",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {store.imageUrl ? (
              <img
                src={store.imageUrl}
                alt={store.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div style={{ textAlign: "center", color: "#a78bfa" }}>
                <ImageIcon size={55} />
                <p>No store image available</p>
              </div>
            )}
          </div>

          <span className="detail-label">
            RATESPHERE STORE
          </span>

          <h1>{store.name}</h1>

          <p className="detail-location">
            <MapPin size={18} />
            {store.address}
          </p>

          {store.email && (
            <p className="detail-location">
              <Mail size={18} />
              {store.email}
            </p>
          )}

          <div className="detail-statistics">
            <div>
              <Star fill="currentColor" size={22} />
              <strong>
                {Number(store.averageRating || 0).toFixed(1)}
              </strong>
              <span>Average Rating</span>
            </div>

            <div>
              <strong>{store.totalRatings || 0}</strong>
              <span>Total Ratings</span>
            </div>
          </div>
        </section>

        {/* Rating section */}
        <section className="rating-panel">
          <span className="detail-label">
            SHARE YOUR EXPERIENCE
          </span>

          <h2>Rate this store</h2>

          <p>
            How was your experience with {store.name}?
            Your feedback helps other customers.
          </p>

          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                type="button"
                key={value}
                className={
                  value <= (hover || rating)
                    ? "rating-star selected"
                    : "rating-star"
                }
                onMouseEnter={() => setHover(value)}
                onMouseLeave={() => setHover(0)}
                onClick={() => {
                  setRating(value);
                  setError("");
                  setMessage("");
                }}
                aria-label={`Rate ${value} stars`}
              >
                <Star
                  size={42}
                  fill={
                    value <= (hover || rating)
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            ))}
          </div>

          <h3>
            {rating === 0
              ? "Select your rating"
              : `${rating} out of 5 stars`}
          </h3>

          {existingRating > 0 && (
            <p className="existing-rating">
              Your previous rating: {existingRating} stars.
              You can update it.
            </p>
          )}

          {message && (
            <div className="detail-success">
              {message}
            </div>
          )}

          {error && (
            <div className="detail-error">
              {error}
            </div>
          )}

          <button
            className="rating-submit"
            onClick={submitRating}
            disabled={!rating || submitting}
          >
            <Send size={17} />

            {submitting
              ? "Saving..."
              : existingRating
                ? "Update Rating"
                : "Submit Rating"}
          </button>
        </section>

      </div>
    </div>
  );
}
