
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Store } from "lucide-react";
import api from "../services/api";
import "./store-details.css";

export default function MyRatings() {
  const navigate = useNavigate();

  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await api.get("/ratings/my-ratings");
        setRatings(response.data.ratings || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load your ratings."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  return (
    <div className="store-detail-page">
      <div className="detail-container">

        <button
          className="detail-back"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="ratings-heading">
          <span className="detail-label">YOUR ACTIVITY</span>
          <h1>My Ratings</h1>
          <p>All the stores you have rated on RateSphere.</p>
        </div>

        {loading && (
          <div className="detail-loading">Loading your ratings...</div>
        )}

        {error && <div className="detail-error">{error}</div>}

        {!loading && !error && ratings.length === 0 && (
          <div className="ratings-empty">
            <Star size={45} />
            <h2>No ratings yet</h2>
            <p>Explore stores and share your first experience.</p>

            <button
              className="rating-submit"
              onClick={() => navigate("/dashboard")}
            >
              Discover Stores
            </button>
          </div>
        )}

        {!loading && ratings.length > 0 && (
          <div className="my-ratings-list">
            {ratings.map(item => (
              <div className="my-rating-card" key={item.id}>
                <div className="my-rating-icon">
                  <Store size={26} />
                </div>

                <div className="my-rating-info">
                  <h3>{item.store?.name || "Store"}</h3>

                  <p>
                    <MapPin size={14} />
                    {item.store?.address || "Address unavailable"}
                  </p>

                  <div className="my-rating-stars">
                    {[1, 2, 3, 4, 5].map(number => (
                      <Star
                        key={number}
                        size={17}
                        fill={number <= item.value ? "currentColor" : "none"}
                      />
                    ))}

                    <strong>{item.value}/5</strong>
                  </div>

                  <small>
                    Last updated:{" "}
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </small>
                </div>

                <button
                  className="rating-edit-button"
                  onClick={() => navigate(`/stores/${item.storeId}`)}
                >
                  Update Rating
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
