import pyads
import pymysql
import time

# PLC Connection Details
AMS_NET_ID = "169.254.195.69.1.1"  # Replace with your actual AMS NET ID
AMS_PORT = 851  # TwinCAT3 runtime port

# MySQL Database Connection Details
DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "Ishan_17"  # Change to your actual MySQL password
DB_NAME = "PaintStation"

# Connect to the PLC
plc = pyads.Connection(AMS_NET_ID, AMS_PORT)

# Function to insert HeartBeat status into MySQL
def log_heartbeat(status):
    try:
        # Connect to MySQL database
        db = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME)
        cursor = db.cursor()

        # Insert heartbeat status into the database
        query = "INSERT INTO HeartBeatLog (status) VALUES (%s)"
        cursor.execute(query, (status,))
        db.commit()

        # Close database connection
        cursor.close()
        db.close()

        print(f"✅ Logged HeartBeat Status: {status}")

    except Exception as e:
        print(f"❌ Database error: {e}")

# Function to compute level from brush number
def get_level_from_brush(brush_number):
    return int(brush_number)  # Ensures it is treated as an INT

# Function to get data from MySQL based on computed level
def get_brush_data(level):
    try:
        # Connect to MySQL database
        db = pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME)
        cursor = db.cursor()

        # Query database to get atom, fluid, and shape based on level
        query = "SELECT atom, fluid, shape FROM BrushFile WHERE level = %s"
        cursor.execute(query, (level,))
        result = cursor.fetchone()

        # Close database connection
        cursor.close()
        db.close()

        return result if result else None

    except Exception as e:
        print(f"❌ Database error: {e}")
        return None

try:
    plc.open()
    if plc.is_open:
        print("✅ PLC Connection established!")

        last_heartbeat = None  # To track the last recorded heartbeat

        while True:
            try:
                # Start timing the cycle
                start_time = time.time()

                # 1️⃣ Read the HeartBeat status from PLC
                heartbeat = plc.read_by_name("GVL_IO.Heartbeat", pyads.PLCTYPE_BOOL)
                print(f"📡 Read GVL_IO.Heartbeat: {heartbeat}")

                # Log to SQL only if the heartbeat value changes
                if last_heartbeat is None or heartbeat != last_heartbeat:
                    log_heartbeat(heartbeat)
                    last_heartbeat = heartbeat  # Update last recorded value

                # 2️⃣ Read the BrushNumber as a BYTE
                brush_number = plc.read_by_name("GVL_Robot.BrushNumber", pyads.PLCTYPE_BYTE)
                print(f"📡 Read GVL_Robot.BrushNumber (BYTE): {brush_number}")

                # 3️⃣ Handle brush_number = 0
                if brush_number == 0:
                    print("⚠️ Brush Number is 0, writing 0 to all PLC variables.")
                    plc.write_by_name("GVL_IO.atom", 0, pyads.PLCTYPE_INT)
                    plc.write_by_name("GVL_IO.fluid", 0, pyads.PLCTYPE_INT)
                    plc.write_by_name("GVL_IO.shape", 0, pyads.PLCTYPE_INT)
                    plc.write_by_name("GVL_IO.test", False, pyads.PLCTYPE_BOOL)
                    print("✅ Successfully wrote 0 values to PLC.")
                
                # 4️⃣ Process valid Brush Numbers (1-64)
                elif 1 <= brush_number <= 64:
                    # Compute level from brush number
                    level = get_level_from_brush(brush_number)
                    print(f"🔄 Computed Level from BrushNumber: {level}")

                    # Fetch brush data from database
                    brush_data = get_brush_data(level)

                    if brush_data:
                        atom, fluid, shape = brush_data
                        print(f"🔄 Fetched Data -> Atom: {atom}, Fluid: {fluid}, Shape: {shape}")

                        # Write data to PLC (assuming INT values for atom, fluid, shape)
                        plc.write_by_name("GVL_IO.atom", atom, pyads.PLCTYPE_INT)
                        plc.write_by_name("GVL_IO.fluid", fluid, pyads.PLCTYPE_INT)
                        plc.write_by_name("GVL_IO.shape", shape, pyads.PLCTYPE_INT)
                        plc.write_by_name("GVL_IO.test", True, pyads.PLCTYPE_BOOL)

                        print("✅ Successfully wrote to PLC: Atom, Fluid, Shape, and set Test=True")
                    else:
                        print(f"❌ No data found in database for Level {level}")

                else:
                    print("⚠️ Brush Number out of range (1-64), skipping database fetch.")

                # Stop timing the cycle
                end_time = time.time()
                cycle_time_ms = (end_time - start_time) * 1000  # Convert to milliseconds
                print(f"⏱️ Cycle Execution Time: {cycle_time_ms:.2f} ms")

                # Sleep for a short interval to avoid excessive PLC reads
                time.sleep(1)

            except Exception as e:
                print(f"❌ Error during PLC operation: {e}")

    else:
        print("❌ Failed to connect to PLC.")

finally:
    plc.close()
    print("🔴 PLC Connection closed.")
