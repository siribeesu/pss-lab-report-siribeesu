import pytest
from datetime import date, timedelta

def test_create_report_normal_status(client):
    """Test creating report with Normal status (result within range)"""
    # Create patient first
    p_resp = client.post("/api/patients/", json={"name": "Alice", "age": 25, "gender": "Female", "contact_number": "111"})
    patient_id = p_resp.json()["id"]

    response = client.post(
        "/api/reports/",
        data={
            "patient_id": patient_id,
            "report_type": "Blood Test",
            "report_date": "2023-10-10",
            "result_value": 100.0,
            "ref_range_min": 70.0,
            "ref_range_max": 110.0
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Normal"
    assert data["result_value"] == 100.0

def test_create_report_abnormal_status_high(client):
    """Test creating report with Abnormal status (result above max)"""
    p_resp = client.post("/api/patients/", json={"name": "Bob", "age": 45, "gender": "Male", "contact_number": "222"})
    patient_id = p_resp.json()["id"]

    response = client.post(
        "/api/reports/",
        data={
            "patient_id": patient_id,
            "report_type": "Blood Test",
            "report_date": "2023-10-10",
            "result_value": 150.0,
            "ref_range_min": 70.0,
            "ref_range_max": 110.0
        }
    )
    assert response.status_code == 200
    assert response.json()["status"] == "Abnormal"

def test_create_report_abnormal_status_low(client):
    """Test creating report with Abnormal status (result below min)"""
    p_resp = client.post("/api/patients/", json={"name": "Charlie", "age": 50, "gender": "Male", "contact_number": "333"})
    patient_id = p_resp.json()["id"]

    response = client.post(
        "/api/reports/",
        data={
            "patient_id": patient_id,
            "report_type": "Urine Test",
            "report_date": "2023-10-10",
            "result_value": 50.0,
            "ref_range_min": 70.0,
            "ref_range_max": 110.0
        }
    )
    assert response.status_code == 200
    assert response.json()["status"] == "Abnormal"

def test_create_report_pending_status_no_result(client):
    """Test creating report with Pending status (no result value)"""
    p_resp = client.post("/api/patients/", json={"name": "Diana", "age": 35, "gender": "Female", "contact_number": "444"})
    patient_id = p_resp.json()["id"]

    response = client.post(
        "/api/reports/",
        data={
            "patient_id": patient_id,
            "report_type": "Blood Test",
            "report_date": "2023-10-10",
            "ref_range_min": 70.0,
            "ref_range_max": 110.0
            # No result_value provided
        }
    )
    assert response.status_code == 200
    assert response.json()["status"] == "Pending"

def test_create_report_pending_status_no_ranges(client):
    """Test creating report with Pending status (no reference ranges)"""
    p_resp = client.post("/api/patients/", json={"name": "Eve", "age": 40, "gender": "Female", "contact_number": "555"})
    patient_id = p_resp.json()["id"]

    response = client.post(
        "/api/reports/",
        data={
            "patient_id": patient_id,
            "report_type": "Custom",
            "report_date": "2023-10-10",
            "result_value": 100.0
            # No ref_range_min or ref_range_max
        }
    )
    assert response.status_code == 200
    assert response.json()["status"] == "Pending"

def test_create_report_status_boundary_min(client):
    """Test status when result equals min boundary"""
    p_resp = client.post("/api/patients/", json={"name": "Frank", "age": 30, "gender": "Male", "contact_number": "666"})
    patient_id = p_resp.json()["id"]

    response = client.post(
        "/api/reports/",
        data={
            "patient_id": patient_id,
            "report_type": "Blood Test",
            "report_date": "2023-10-10",
            "result_value": 70.0,  # Exactly at min boundary
            "ref_range_min": 70.0,
            "ref_range_max": 110.0
        }
    )
    assert response.status_code == 200
    assert response.json()["status"] == "Normal"

def test_create_report_status_boundary_max(client):
    """Test status when result equals max boundary"""
    p_resp = client.post("/api/patients/", json={"name": "Grace", "age": 32, "gender": "Female", "contact_number": "777"})
    patient_id = p_resp.json()["id"]

    response = client.post(
        "/api/reports/",
        data={
            "patient_id": patient_id,
            "report_type": "Lipid Panel",
            "report_date": "2023-10-10",
            "result_value": 110.0,  # Exactly at max boundary
            "ref_range_min": 70.0,
            "ref_range_max": 110.0
        }
    )
    assert response.status_code == 200
    assert response.json()["status"] == "Normal"

def test_list_reports_all(client):
    """Test listing all reports"""
    # Create patient and 2 reports
    p_resp = client.post("/api/patients/", json={"name": "Henry", "age": 28, "gender": "Male", "contact_number": "888"})
    patient_id = p_resp.json()["id"]

    for i in range(2):
        client.post(
            "/api/reports/",
            data={
                "patient_id": patient_id,
                "report_type": "Blood Test",
                "report_date": "2023-10-10",
                "result_value": 90.0 + i,
                "ref_range_min": 70.0,
                "ref_range_max": 110.0
            }
        )

    response = client.get("/api/reports/")
    assert response.status_code == 200
    assert len(response.json()) == 2

def test_filter_reports_by_status(client):
    """Test filtering reports by status"""
    p_resp = client.post("/api/patients/", json={"name": "Iris", "age": 29, "gender": "Female", "contact_number": "999"})
    patient_id = p_resp.json()["id"]

    # Create Normal report
    client.post(
        "/api/reports/",
        data={
            "patient_id": patient_id,
            "report_type": "Blood Test",
            "report_date": "2023-10-10",
            "result_value": 90.0,
            "ref_range_min": 70.0,
            "ref_range_max": 110.0
        }
    )

    # Create Abnormal report
    client.post(
        "/api/reports/",
        data={
            "patient_id": patient_id,
            "report_type": "Urine Test",
            "report_date": "2023-10-11",
            "result_value": 200.0,
            "ref_range_min": 70.0,
            "ref_range_max": 110.0
        }
    )

    # Filter by Normal
    response = client.get("/api/reports/?status=Normal")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["status"] == "Normal"

def test_filter_reports_by_report_type(client):
    """Test filtering reports by report type"""
    p_resp = client.post("/api/patients/", json={"name": "Jack", "age": 33, "gender": "Male", "contact_number": "1000"})
    patient_id = p_resp.json()["id"]

    # Create Blood Test report
    client.post(
        "/api/reports/",
        data={
            "patient_id": patient_id,
            "report_type": "Blood Test",
            "report_date": "2023-10-10",
            "result_value": 90.0,
            "ref_range_min": 70.0,
            "ref_range_max": 110.0
        }
    )

    # Create Lipid Panel report
    client.post(
        "/api/reports/",
        data={
            "patient_id": patient_id,
            "report_type": "Lipid Panel",
            "report_date": "2023-10-11",
            "result_value": 180.0,
            "ref_range_min": 0.0,
            "ref_range_max": 200.0
        }
    )

    # Filter by Blood Test
    response = client.get("/api/reports/?report_type=Blood%20Test")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["report_type"] == "Blood Test"

def test_filter_reports_by_date_range(client):
    """Test filtering reports by date range"""
    p_resp = client.post("/api/patients/", json={"name": "Kate", "age": 27, "gender": "Female", "contact_number": "1001"})
    patient_id = p_resp.json()["id"]

    # Create report on Oct 10
    client.post(
        "/api/reports/",
        data={
            "patient_id": patient_id,
            "report_type": "Blood Test",
            "report_date": "2023-10-10",
            "result_value": 90.0,
            "ref_range_min": 70.0,
            "ref_range_max": 110.0
        }
    )

    # Create report on Oct 20
    client.post(
        "/api/reports/",
        data={
            "patient_id": patient_id,
            "report_type": "Blood Test",
            "report_date": "2023-10-20",
            "result_value": 95.0,
            "ref_range_min": 70.0,
            "ref_range_max": 110.0
        }
    )

    # Filter between Oct 15-25
    response = client.get("/api/reports/?date_from=2023-10-15&date_to=2023-10-25")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["report_date"] == "2023-10-20"

def test_get_report_detail(client):
    """Test retrieving individual report detail"""
    p_resp = client.post("/api/patients/", json={"name": "Leo", "age": 38, "gender": "Male", "contact_number": "1002"})
    patient_id = p_resp.json()["id"]

    report_resp = client.post(
        "/api/reports/",
        data={
            "patient_id": patient_id,
            "report_type": "Blood Test",
            "report_date": "2023-10-10",
            "result_value": 100.0,
            "ref_range_min": 70.0,
            "ref_range_max": 110.0,
            "notes": "Test notes"
        }
    )
    report_id = report_resp.json()["id"]

    response = client.get(f"/api/reports/{report_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == report_id
    assert data["notes"] == "Test notes"

def test_update_report(client):
    """Test updating report information"""
    p_resp = client.post("/api/patients/", json={"name": "Mona", "age": 31, "gender": "Female", "contact_number": "1003"})
    patient_id = p_resp.json()["id"]

    report_resp = client.post(
        "/api/reports/",
        data={
            "patient_id": patient_id,
            "report_type": "Blood Test",
            "report_date": "2023-10-10",
            "result_value": 100.0,
            "ref_range_min": 70.0,
            "ref_range_max": 110.0
        }
    )
    report_id = report_resp.json()["id"]

    # Update result value
    update_resp = client.put(
        f"/api/reports/{report_id}",
        data={
            "result_value": 150.0,
            "notes": "Updated notes"
        }
    )
    assert update_resp.status_code == 200
    data = update_resp.json()
    assert data["result_value"] == 150.0
    assert data["status"] == "Abnormal"  # Status should recompute

def test_delete_report(client):
    """Test deleting a report"""
    p_resp = client.post("/api/patients/", json={"name": "Nina", "age": 36, "gender": "Female", "contact_number": "1004"})
    patient_id = p_resp.json()["id"]

    report_resp = client.post(
        "/api/reports/",
        data={
            "patient_id": patient_id,
            "report_type": "Blood Test",
            "report_date": "2023-10-10",
            "result_value": 90.0,
            "ref_range_min": 70.0,
            "ref_range_max": 110.0
        }
    )
    report_id = report_resp.json()["id"]

    # Delete report
    delete_resp = client.delete(f"/api/reports/{report_id}")
    assert delete_resp.status_code == 204

    # Verify deleted
    get_resp = client.get(f"/api/reports/{report_id}")
    assert get_resp.status_code == 404

def test_get_nonexistent_report(client):
    """Test retrieving non-existent report returns 404"""
    response = client.get("/api/reports/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404

def test_dashboard_returns_counts(client):
    """Test dashboard endpoint returns correct aggregated statistics"""
    # Seed data
    p_resp = client.post("/api/patients/", json={"name": "Oscar", "age": 25, "gender": "Male", "contact_number": "1005"})
    patient_id = p_resp.json()["id"]

    client.post(
        "/api/reports/",
        data={
            "patient_id": patient_id,
            "report_type": "Blood Test",
            "report_date": "2023-10-10",
            "result_value": 100.0,
            "ref_range_min": 70.0,
            "ref_range_max": 110.0
        }
    )

    response = client.get("/api/dashboard/")
    assert response.status_code == 200
    data = response.json()
    assert "total_patients" in data
    assert "total_reports" in data
    assert "abnormal_reports" in data
    assert "reports_today" in data
    assert data["total_patients"] >= 1
    assert data["total_reports"] >= 1

def test_dashboard_abnormal_count(client):
    """Test dashboard correctly counts abnormal reports"""
    p_resp = client.post("/api/patients/", json={"name": "Paul", "age": 44, "gender": "Male", "contact_number": "1006"})
    patient_id = p_resp.json()["id"]

    # Create abnormal report
    client.post(
        "/api/reports/",
        data={
            "patient_id": patient_id,
            "report_type": "Blood Test",
            "report_date": "2023-10-10",
            "result_value": 200.0,
            "ref_range_min": 70.0,
            "ref_range_max": 110.0
        }
    )

    response = client.get("/api/dashboard/")
    assert response.status_code == 200
    data = response.json()
    assert data["abnormal_reports"] >= 1


