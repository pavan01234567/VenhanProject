import React, { useEffect, useState } from "react";
import axios from "axios";

function Loans() {
  // ✅ API URLs — make sure ports match your backend
  const API_URL = "https://localhost:7169/api/Loans";
  const BOOKS_URL = "https://localhost:7169/api/Books";
  const BORROWERS_URL = "https://localhost:7169/api/Borrowers";

  const [loans, setLoans] = useState([]);
  const [books, setBooks] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [form, setForm] = useState({
    bookId: "",
    borrowerId: "",
    dueDate: "",
  });
  const [showOverdue, setShowOverdue] = useState(false);

  // ✅ Load data when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Fetch all data in parallel
  const fetchData = async () => {
    try {
      const [loanRes, bookRes, borrowerRes] = await Promise.all([
        axios.get(API_URL),
        axios.get(BOOKS_URL),
        axios.get(BORROWERS_URL),
      ]);
      setLoans(loanRes.data);
      setBooks(bookRes.data);
      setBorrowers(borrowerRes.data);
    } catch (error) {
      console.error("❌ Error loading data:", error);
      alert("Failed to load data. Check backend connection.");
    }
  };

  // ✅ Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Borrow a book
  const handleBorrow = async (e) => {
    e.preventDefault();
    if (!form.bookId || !form.borrowerId || !form.dueDate) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await axios.post(`${API_URL}/borrow`, {
        bookId: parseInt(form.bookId),
        borrowerId: parseInt(form.borrowerId),
        dueDate: form.dueDate,
      });
      alert("Book borrowed successfully!");
      setForm({ bookId: "", borrowerId: "", dueDate: "" });
      fetchData();
    } catch (error) {
      console.error("❌ Error borrowing book:", error);
      alert("Error borrowing book. Check backend API.");
    }
  };

  // ✅ Return a book
  const handleReturn = async (loanId) => {
    if (window.confirm("Mark this loan as returned?")) {
      try {
        await axios.post(`${API_URL}/return/${loanId}`);
        fetchData();
      } catch (error) {
        console.error("❌ Error returning book:", error);
        alert("Error returning book.");
      }
    }
  };

  // ✅ Show overdue loans
  const handleShowOverdue = async () => {
    try {
      if (showOverdue) {
        fetchData(); // show all
      } else {
        const res = await axios.get(`${API_URL}/overdue`);
        setLoans(res.data);
      }
      setShowOverdue(!showOverdue);
    } catch (error) {
      console.error("❌ Error loading overdue loans:", error);
    }
  };

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h2>Loan Management</h2>

      {/* ✅ Borrow Book Form */}
      <form onSubmit={handleBorrow} style={{ marginBottom: 20 }}>
        <select
          name="bookId"
          value={form.bookId}
          onChange={handleChange}
          required
        >
          <option value="">Select Book</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>

        <select
          name="borrowerId"
          value={form.borrowerId}
          onChange={handleChange}
          required
        >
          <option value="">Select Borrower</option>
          {borrowers.map((br) => (
            <option key={br.id} value={br.id}>
              {br.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          required
        />

        <button type="submit">Borrow Book</button>
      </form>

      <button onClick={handleShowOverdue} style={{ marginBottom: 10 }}>
        {showOverdue ? "Show All Loans" : "Show Overdue Loans"}
      </button>

      {/* ✅ Loans Table */}
      <table border="1" width="100%" cellPadding="10">
        <thead>
          <tr style={{ backgroundColor: "#ddd" }}>
            <th>ID</th>
            <th>Book</th>
            <th>Borrower</th>
            <th>Borrowed At</th>
            <th>Due Date</th>
            <th>Returned At</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loans.length === 0 ? (
            <tr>
              <td colSpan="8" align="center">
                No Loans Found
              </td>
            </tr>
          ) : (
            loans.map((loan) => (
              <tr
                key={loan.id}
                style={{
                  backgroundColor:
                    !loan.returnedAt && new Date(loan.dueDate) < new Date()
                      ? "#ffcccc"
                      : "white",
                }}
              >
                <td>{loan.id}</td>
                <td>{loan.book?.title}</td>
                <td>{loan.borrower?.name}</td>
                <td>{new Date(loan.borrowedAt).toLocaleDateString()}</td>
                <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                <td>
                  {loan.returnedAt
                    ? new Date(loan.returnedAt).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  {loan.returnedAt
                    ? "Returned"
                    : new Date(loan.dueDate) < new Date()
                    ? "Overdue"
                    : "Active"}
                </td>
                <td>
                  {!loan.returnedAt && (
                    <button onClick={() => handleReturn(loan.id)}>
                      Return
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Loans;
