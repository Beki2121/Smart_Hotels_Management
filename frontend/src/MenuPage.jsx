import React, { useEffect, useState } from "react";
import api from "./apiClient";

const MenuPage = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    price: "",
    description: "",
  });

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, itemsRes] = await Promise.all([
        api.get("/menu/categories"),
        api.get("/menu"),
      ]);

      const categoriesData = await categoriesRes.json();
      const itemsData = await itemsRes.json();

      if (categoriesRes.ok) setCategories(categoriesData);
      if (itemsRes.ok) setItems(itemsData);
    } catch (err) {
      setError("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    if (!formData.name || !formData.category_id || !formData.price) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const response = await api.post("/menu", {
        name: formData.name,
        category_id: parseInt(formData.category_id),
        price: parseFloat(formData.price),
        description: formData.description,
      });

      const data = await response.json();

      if (response.ok) {
        setItems([...items, data]);
        setShowForm(false);
        setFormData({ name: "", category_id: "", price: "", description: "" });
        setError("");
      }
    } catch (err) {
      setError("Failed to create item");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🍽️ Menu Management</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Item"}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="form-card">
          <h2>Add Menu Item</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Item name"
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Price *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Item description"
                rows="3"
              />
            </div>
          </div>

          <button className="btn-primary" onClick={handleCreateItem}>
            Create Item
          </button>
        </div>
      )}

      {loading ? (
        <div className="loader">Loading menu...</div>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <div key={item.id} className="item-card">
              <h3>{item.name}</h3>
              <p className="category">{item.category}</p>
              <p className="description">{item.description}</p>
              <div className="item-footer">
                <span className="price">${item.price.toFixed(2)}</span>
                {!item.is_available && (
                  <span className="badge-unavailable">Unavailable</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuPage;
